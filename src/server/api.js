import { Router } from "express";
import { check, validationResult } from "express-validator";
import { arrayValidate, numberValidate, objectValidate, stringValidate, uuidValidate } from "./validator.js";
import { db } from "./db.js";
import path from 'path'
import { nanoid } from 'nanoid'
import { groupBy, md5 } from "./util.js"
import { decode } from "html-entities";


export const apiRouter = Router();


const mrError = (next, res, err) => {
    res.status(400);
    return next(err);
}

const mrValidate = (next, req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400)
     return next(errors.errors);
    }
}

apiRouter.get("/", (req, res) => {
    return res.send("We have received you!");
})



const getWhereClause = (key, placeholder = { }, value, multi=false,) => {
     if(!value) return null;
     const placeholderInc = () => {
        placeholder.i = placeholder.i + 1;
         return placeholder.i;
     }
     if(!multi) {
      return { query : `${key}=$${placeholderInc()}`, value }; 
     } else {
        
        return { query: `${key} = ANY ( $${placeholderInc()})`, value: [value] };
     }
}

const getUpdateQuery = (key, bindNumber) => `${key}=$${bindNumber}`;

apiRouter.get("/inventory", async(req, res) => {
    const {size, color, gender, brands, category} = req.query
    const hasQuery = size || color || gender || brands || category;
    const placeHolderValue = { i : 0};
    const queryStash = [getWhereClause('size.id', placeHolderValue, size),
                        getWhereClause('color.id', placeHolderValue, color),
                        getWhereClause('gender.id', placeHolderValue, gender, true),
                        getWhereClause('brands.id', placeHolderValue, brands, true),
                        getWhereClause('category.id', placeHolderValue, category, true)
                    ].filter(item => item);


    const queryString = queryStash.map(q => q.query).join(" and ");
    const queryValue = queryStash.map(q => q.value);

    const { rows } = await db.query(`select distinct(stock.productid) as pid, product.name as name , images.path as images , brands.name as brand, count, price from stock 
                                    join product on product.id = stock.productid 
                                    join sizecolor on sizecolor.id = stock.sizecolorid 
                                    join sizegender on sizegender.id = sizecolor.sizegenderid 
                                    join color on color.id = sizecolor.colorid 
                                    join gender on gender.id = sizegender.genderid
                                    join size on size.id = sizegender.sizeid 
                                    join category on category.id = product.categoryid 
                                    join images on images.productid = product.id and images.sizecolorid = sizecolor.id 
                                    join brands on brands.id = product.brandid ${hasQuery ? 'where  ' + queryString : ''}`, queryValue)
    return res.json(rows);

})

apiRouter.get("/inventoryMeta", async(req, res) => {
    const {rows: size} = await db.query(`select * from size`);
    const {rows: gender} = await db.query('select * from gender');
    const { rows: color } = await db.query('select * from color');
    const { rows: category } = await db.query('select * from category');
    const { rows: brands } = await db.query('select * from brands');
    return res.json({
        size,
        gender,
        color,
        category,
        brands
    })
 })


 const getSizeGenderComboIfExist = async (sizeId, genderId) => {
        const { rows } = await db.query(`select id from sizegender where sizeid=$1 and genderid=$2`, [sizeId, genderId]);
        if(rows.length) {
            return rows[0].id
        }
        return false;
 }

 const getSizeColorComboIfExist = async (sizeGenderId, colorId) => {
    const { rows } = await db.query(`select id from sizecolor where sizegenderid=$1 and colorid=$2`, [sizeGenderId, colorId]);
    if(rows.length) {
        return rows[0].id
    }
    return false;
}

const getProductIfExist = async (productName) => {
    const { rows } = await db.query(`select id from product where name=$1`, [productName]);
    if(rows.length) {
        return rows[0].id
    }
    return false;
}


 apiRouter.post("/createInventory", [
            objectValidate('brands'),
            objectValidate('category'),
            objectValidate('color'),
            stringValidate('description'),
            objectValidate('gender'),
            arrayValidate('image'),
            stringValidate('product'),
            objectValidate('size'),
            numberValidate('count'),
            numberValidate('price')
     ], async(req, res, next) => {
        mrValidate(next, req, res);
        const { brands, category, color, description, gender, image, product, size, count, price, tagid } = req.body;
        try {
            let productId = await getProductIfExist(product);
            if(!productId) {
            const {rows: product_id} = await db.query(`insert into product 
                            (name, description, tagid, brandid, categoryid) 
                            values 
                            ($1, $2, $3, $4, $5) returning id`, [decode(product), decode(description), null, brands.value, category.value]);
                    productId = product_id[0].id;
            }
            
           let sizeGenderId = await getSizeGenderComboIfExist(size.value, gender.value);
           if(!sizeGenderId) {
             const { rows: sizegender } = await db.query(`insert into sizegender (sizeid, genderid) values ($1, $2) returning id`, [size.value, gender.value]);
             sizeGenderId = sizegender[0].id;
           }
           let sizeColorId = await getSizeColorComboIfExist(sizeGenderId, color.value);
           if(!sizeColorId) {
            const { rows: sizecolor } = await db.query(`insert into sizecolor (sizegenderid, colorid) values ($1, $2) returning id`, [sizeGenderId, color.value]);
            sizeColorId = sizecolor[0].id
           }

            const { rows: img } = await db.query('insert into images (path, productid, sizecolorid) values ($1, $2, $3) returning id', [image, productId, sizeColorId]);

            const { rows } = await db.query(`insert into stock (productid, sizecolorid, count, price) values ($1, $2, $3, $4) returning id`, [productId, sizeColorId, count, price]);

            return res.json({rows})

        } catch (e) {
            mrError(next, res, e.detail);
        }
     })

/*
 size.id as size_id,
                size.name as size, 
                size.short as size_short
                size.unit as size_unit
                gender.id as gender_id,
                gender.name as gender,
                gender.short as gender_short,
                color.id as color_id,
                color.name as color,
                color.code as color_code,
                category.id as category_id,
                category.name as category,
                barnds.id as brand_id,
                barnds.name as barnds
                FROM
                size, gender, color, category, brands;


*/
apiRouter.get("/brands", async (req, res, next) => {
    try {
        const {rows} = await db.query("select * from brands");
        return res.json(rows)
      } catch (e) {
        return mrError(next, res, e.detail)
      }
})

apiRouter.post('/upload', async (req, res, next) => {
    console.log(req.files);
    const fileKeys =  req.files && Object.keys(req.files) || [];
    const uploadedFilesNames = [];
    if(fileKeys.length > 0) {
        try { 
        for(const key of fileKeys ) {
            const filemd5 = req.files[key].md5;
            const uniqueId = nanoid();
            const fileExt = path.extname(req.files[key].name);
            const filename = `${uniqueId}-${filemd5}${fileExt}`
            uploadedFilesNames.push(filename);
            await req.files[key].mv(path.join(path.resolve(), "uploads", filename));
        }
        } catch (e) {
            return mrError(next, res, e);
        }
        return res.json({ files: uploadedFilesNames})
    }

    return res.status(400).json({error: "bad data"});
})

apiRouter.post("/createBrand", [stringValidate('name'), stringValidate('origin')], async (req, res, next) => {
       mrValidate(next, req, res);
       const { name, origin } = req.body;
       try {
         const {rows} = await db.query('insert into brands (name, origin) values($1, $2) returning id', [decode(name), decode(origin)]);
         return res.json(rows)
       } catch (e) {
            return mrError(next, res, e.detail)
       }
});

apiRouter.get("/categories", async (req, res, next) => {
    try {
        const {rows} = await db.query('select * from category');
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
})

apiRouter.post("/createCategory", [stringValidate('name')], async (req, res, next) => {
    mrValidate(next, req, res);
    const { name } = req.body;
    try {
        const {rows} = await db.query('insert into category (name) values($1) returning id', [name]);
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
});


apiRouter.get("/genders", async (req, res, next) => {
    try {
        const {rows} = await db.query('select * from gender');
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
})

apiRouter.post("/createGender", [stringValidate('name'), stringValidate('short')], async (req, res, next) => {
    mrValidate(next, req, res);
    const { name, short } = req.body;
    try {
        const {rows} = await db.query('insert into gender (name, short) values($1, $2) returning id', [decode(name), decode(short)]);
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
})


apiRouter.get("/tags", async (req, res, next) => {  
    try {
        const {rows} = await db.query('select * from tags');
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
})

apiRouter.post("/createtag", [stringValidate('name'), stringValidate('effecttype'), numberValidate('effectvalue')], async (req, res, next) => {
    mrValidate(next, req, res);
    const { name, effecttype, effectvalue } = req.body;
    try {
        const {rows} = await db.query('insert into tags (name, effecttype, effectvalue) values($1, $2, $3) returning id', [decode(name), decode(effecttype), decode(effectvalue)]);
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
});

apiRouter.get("/products", async (req, res, next) => {
    try {
        const {rows} = await db.query('select product.id, product.name as product_name, category.name as category_name, brands.name as brand_name, description from product inner join brands on brands.id = product.brandid inner join category on category.id = product.categoryid');
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
});


const getObjectByID = async (object, id) => {
    try {
        const { rows } = await db.query(`select * from ${object} where id=$1;`, [id]);
        return rows[0];
    } catch (e) {
        throw e;
    }
}

apiRouter.get("/product/:id", async (req, res, next) => {
    try {
        const { id } = req.params; 
        const {size, color, gender, szcid } = req.query
        const hasQuery = size || color || gender || szcid;
        const placeHolderValue = { i : 1};
        const queryStash = [getWhereClause('size.id', placeHolderValue, size),
                            getWhereClause('color.id', placeHolderValue, color),
                            getWhereClause('gender.id', placeHolderValue, gender),
                            getWhereClause('stock.sizecolorid', placeHolderValue, szcid),
                        ].filter(item => item);
    
    
        const queryString = queryStash.map(q => q.query).join(" and ");
        const queryValue = queryStash.map(q => q.value);
        if(!id) {
            res.statusCode = 400;
            throw new Error("Invalid product id!");
        }

        const { rows } = await db.query(`select 
                                            product.id as pid,
                                            stock.sizecolorid as szcid,
                                            product.name as name,
                                            product.description as desc,
                                            stock.id as sid,
                                            brands.id as brand_id,
                                            size.id as size_id,
                                            gender.id as gender_id,
                                            color.id as color_id,
                                            category.id as category_id,
                                            images.path as images,
                                            stock.count as count, 
                                            stock.price as price
                                            from stock  
                                            join product on product.id = stock.productid 
                                            join sizecolor on sizecolor.id = stock.sizecolorid 
                                            join sizegender on sizegender.id = sizecolor.sizegenderid 
                                            join color on color.id = sizecolor.colorid 
                                            join gender on gender.id = sizegender.genderid
                                            join size on size.id = sizegender.sizeid 
                                            join category on category.id = product.categoryid 
                                            join images on images.productid = product.id and images.sizecolorid = sizecolor.id 
                                            join brands on brands.id = product.brandid
                                            and product.id = $1 ${hasQuery ? 'where  ' + queryString : ''}
                                        `, hasQuery ? [id, ...queryValue]: [id]);
     
      return res.json(await Promise.all(rows.map(async ({size_id, color_id, gender_id, brand_id, category_id, ...remain}) => {
        return {
            size: await getObjectByID("size", size_id),
            color: await getObjectByID("color", color_id),
            gender: await getObjectByID("gender", gender_id),
            brands: await getObjectByID("brands", brand_id),
            category: await getObjectByID("category", category_id),
            ...remain
        }
      })));
    } catch(e) {
        return mrError(next, res, e.detail)
    }

});


apiRouter.post("/createProduct", [stringValidate('name'), stringValidate('description'),  uuidValidate('brandid'), uuidValidate('categoryid')], async (req, res, next) => {
    mrValidate(next, req, res);
    const { name, description, tagid, brandid, categoryid } = req.body;
    try {
        const {rows} = await db.query('insert into product (name, description, tagid, brandid, categoryid) values($1, $2, $3, $4, $5) returning id', [decode(name), decode(description), tagid, brandid, categoryid]);
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
});


apiRouter.get("/sizes", async (req, res, next) => {
    mrValidate(next, req, res);
    try {
        const {rows} = await db.query('select * from size');
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
});


apiRouter.post("/createSize", [stringValidate('name'), stringValidate('short'),  stringValidate('size'), stringValidate('unit')], async (req, res, next) => {
    mrValidate(next, req, res);
    const { name, short, size, unit } = req.body;
    try {
        const {rows} = await db.query('insert into size (name, short, size, unit) values($1, $2, $3, $4) returning id', [decode(name), decode(short), decode(size), decode(unit)]);
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
});

apiRouter.get("/colors", async (req, res, next) => {
    mrValidate(next, req, res);
    try {
        const {rows} = await db.query('select * from color');
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
});

apiRouter.post("/createColor", [stringValidate('name'), stringValidate('code')], async (req, res, next) => {
    mrValidate(next, req, res);
    const { name, code } = req.body;
    try {
        const {rows} = await db.query('insert into color (name, code) values($1, $2) returning id', [decode(name), decode(code)]);
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
});


apiRouter.post("/createStock", [uuidValidate('productid'), uuidValidate('sizeid'), uuidValidate('genderid'), uuidValidate('colorid'), numberValidate('count'), numberValidate('price')], async (req, res, next) => {
    mrValidate(next, req, res);
    const {productid, sizeid, genderid, colorid, count, price } = req.body; 
    let result;
    try {
         result = await db.query("insert into sizegender (sizeid, genderid) values ($1, $2) returning id", [sizeid, genderid]);
         const sgid = result.rows[0].id;
         result = await db.query("insert into sizecolor (sizegenderid, colorid) values ($1, $2) returning id", [sgid, colorid]);
         const scid = result.rows[0].id;
         const { rows } = await db.query("insert into stock (productid, sizecolorid, count, price) values ($1, $2, $3, $4 ) returning id", [productid, scid, count, price]);
         return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail);
    }
});

apiRouter.get("/stock/:id", [uuidValidate('id')],  async(req, res, next) => {
    const { id } = req.params;
    if(!id) {
        res.statusCode = 400;
        throw new Error("Invalid Stock id!");
    }
    try {
       const { rows } = await db.query("select count, price, productid from stock where id=$1", [id]);
       return res.json(rows[0]);
    } catch (e) {
        return mrError(next, res, e.detail)
    }

});


apiRouter.put("/updateStock", [uuidValidate('productid'), objectValidate('size'), objectValidate('gender'), objectValidate('brands'),objectValidate('color'), objectValidate('category'), numberValidate('count'), numberValidate('price')], async (req, res, next) => {
    mrValidate(next, req, res);
    const { productid, stockid, count, price, brands, image, category, size, gender, color, } = req.body;
    const { value: sizeid } = size;
    const { value: colorid } = color;
    const { value: genderid } = gender;
    const { value: brandsid } = brands;
    const { value: categoryid } = category;

    try {
      
      {
        let bindNumber = 0;
        const updateColumns = [];
        updateColumns.push(brandsid && getUpdateQuery('brandid', ++bindNumber));
        updateColumns.push(categoryid && getUpdateQuery('categoryid', ++bindNumber));
        const updateQueries = `set ` + updateColumns.filter(i => i).join(", ");
        const { rows: productUpdate } = await db.query(`update product ${updateQueries} where id=$${++bindNumber}`, [brandsid, categoryid, productid])
      }

      let { rows:sizegender } = await db.query(`select id from sizegender where sizeid=$1 and genderid=$2`, [sizeid, genderid]);
      if(!sizegender.length) {
        const { rows } = await db.query(`insert into sizegender (sizeid, genderid) values ($1, $2) returning id`, [sizeid, genderid]);
        sizegender = rows;
      }
      sizegender = sizegender.map(({id}) => id);
      let { rows: sizecolor } = await db.query(`select id from sizecolor where sizegenderid=$1 and colorid=$2`, [sizegender[0], colorid]);
      if(!sizecolor.length) {
        const { rows } = await db.query(`insert into sizecolor (sizegenderid, colorid) values ($1, $2) returning id`, [sizegender[0], colorid]);
        sizecolor = rows;
      }

      sizecolor = sizecolor.map(({id}) => id);

      {
        const { rows } = await db.query(`select id from images where sizecolorid=$1`,[sizecolor[0]]);
        if(!rows.length) {
            const imagesPath = '{' + image.join(",") + '}';
           const { rows:imageid } = await db.query(`insert into images (path, productid, sizecolorid) values ($1, $2, $3) returning id`, [imagesPath, productid, sizecolor[0]]);
        }
      }


      let bindNumber = 0;
      const updateColumns = [];
      updateColumns.push(count && getUpdateQuery('count', ++bindNumber));
      updateColumns.push(price && getUpdateQuery('price', ++bindNumber));
      updateColumns.push(sizecolor[0] && getUpdateQuery('sizecolorid', ++bindNumber));
      const updateQueries = `set ` + updateColumns.filter(i => i).join(', ');
      const { rows } = await db.query(`update stock ${updateQueries} where id=$${++bindNumber}`, [count, price, sizecolor[0], stockid]);
      return res.json(rows);

    } catch(e) {
        return mrError(next, res, e.detail);
    }
});

apiRouter.put("/updateImagesOrder", [uuidValidate("pid"), uuidValidate("szid"), arrayValidate('images')], async (req, res, next) => {
    mrValidate(next, req, res);
    try {
        let { images, pid, szid } = req.body;
        if(!Array.isArray(images)) return res.status(400).json({error: "bad request"});
        images = `{${images.join(',')}}`
        const { rows } = await db.query("update images set path=$1 where productid=$2", [images, pid]);
        return res.json(rows);
      } catch(e) {
          return mrError(next, res, e.detail);
      }
})


apiRouter.put("/updateProduct", [stringValidate('name'), stringValidate('description'), uuidValidate('tagid'), uuidValidate('brandid'), uuidValidate('categoryid')], async (req, res, next) => {
    mrValidate(next, req, res);
    const { name, text, tagid, brandid, categoryid} = req.body;
    try {
        const { rows } = await db.query("update product set name=$1, description=$2', tagid=$3, brandid=$4, categoryid=$5", [name, text, tagid, brandid, categoryid]);
        return res.json(rows);
    } catch(e) {
        return mrError(next, res, e.detail);
    }

});


const createSession = (id, permission, req, res, next) => {
    const { redirect } = req.query;
    req.session.regenerate((err) => {
        if(err) next(err);
        if(permission === "admin") {
            const now = new Date()
            const expiresAt = new Date(+now + 120 * 1000)
            res.cookie("isAdmin", true, {expires: expiresAt, httpOnly: true })
        }
        req.session.user = { id, permission }; 
        req.session.save((err)=> {
            if(err) return next(err);
            return res.redirect(redirect ? redirect : "/");
        })
    })
}

export const isValidSession = (req, res, next) => {
    if(req.session?.user?.id) {
        return true;
    } else {
        return false;
    }
}

export const isAdminSesion = (req, res, next) => {
    let { redirect } = req.query;
     redirect = redirect || "/admin"
    if(req.session?.user?.permission === "admin") {
        next();
    } else {
        res.status(403);
       return res.redirect(`/login?redirect=${redirect ? redirect : '/' }`);
    }
}

apiRouter.post("/login", [stringValidate('username'), stringValidate('password')], async (req, res, next) => {
    const { username, password } = req.body;
    const { redirect } = req.query;
    try {
            if(username && password) {
            const { rows } = await db.query("select id, password, permissionid from users where username=$1", [username]);
            if(rows.length < 1) {
                return res.status(401).json({ error: "invalid credentials"});
            }
            const {id, password: passwordHash, permissionid } = rows[0];
            const md5Hash = md5(password);
            if(md5Hash === passwordHash) {
                const {rows} = await db.query("select name from permissions where id=$1", [permissionid]);
                return createSession(id, rows[0].name, req, res, next);
            } else {
                return res.status(401).json({ error: "invalid credentials"})
            }
        } else {
            if(isValidSession(req)){
             const sessionUser = req.session.user;
              return req.session.regenerate((err)=> {  
                err && next(err);
                req.session.user = sessionUser;
                req.session.save(err => err && next(err));  
                return res.redirect(redirect ? redirect : "/");
              });
              
            }
        }
        return mrValidate(next, req, res);
    } catch (e) {
        return mrError(next, res, e.detail);
    }
});

apiRouter.get("/permissions", (req, res, next) => {
    if(req.session?.user) {
        return res.json({permissions: req.session.user.permission});
    } else {
        return res.json({permissions: "guest"});
    }

})





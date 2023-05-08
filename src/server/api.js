import { Router } from "express";
import { check, validationResult } from "express-validator";
import { arrayValidate, numberValidate, objectValidate, stringValidate, uuidValidate } from "./validator.js";
import { db } from "./db.js";
import path from 'path'
import { nanoid } from 'nanoid'
import { groupBy } from "./util.js"

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

const runQuery = async (query="", args=[], res) => {
    try {
        return await db.query(query, args);
    } catch (e) {
        return res.status(400).json({error: e.detail})
     }
}


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

    const { rows } = await db.query(`select product.id as pid,  stock.id as sid, product.name as name , size.name as size, color.name as color, images.path as images , brands.name as brand, count, price from stock 
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
            stringValidate('count'),
            stringValidate('price')
     ], async(req, res, next) => {
        mrValidate(next, req, res);
        const { brands, category, color, description, gender, image, product, size, count, price, tagid } = req.body;
        try {
            let productId = await getProductIfExist(product);
            if(!productId) {
            const {rows: product_id} = await db.query(`insert into product 
                            (name, description, tagid, brandid, categoryid) 
                            values 
                            ($1, $2, $3, $4, $5) returning id`, [product, description, null, brands.value, category.value]);
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

            const { rows } = await db.query(`insert into stock (productid, sizecolorid, count, price) values ($1, $2, $3, $4) returning id`, [productId, sizeColorId, +count, +price]);

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
         const {rows} = await db.query('insert into brands (name, origin) values($1, $2) returning id', [name, origin]);
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
        const {rows} = await db.query('insert into gender (name, short) values($1, $2) returning id', [name.toUpperCase(), short.toUpperCase()]);
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
})


apiRouter.post("/createGender", [stringValidate('name'), stringValidate('short')], async (req, res, next) => {
    mrValidate(next, req, res);
    const { name, short } = req.body;
    try {
        const {rows} = await db.query('insert into gender (name, short) values($1, $2) returning id', [name.toUpperCase(), short.toUpperCase()]);
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
        const {rows} = await db.query('insert into tags (name, effecttype, effectvalue) values($1, $2, $3) returning id', [name, effecttype, effectvalue]);
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
})

apiRouter.get("/products", async (req, res, next) => {
    try {
        const {rows} = await db.query('select product.id, product.name as product_name, category.name as category_name, brands.name as brand_name, description from product inner join brands on brands.id = product.brandid inner join category on category.id = product.categoryid');
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
})


apiRouter.post("/createProduct", [stringValidate('name'), stringValidate('description'),  uuidValidate('brandid'), uuidValidate('categoryid')], async (req, res, next) => {
    mrValidate(next, req, res);
    const { name, description, tagid, brandid, categoryid } = req.body;
    try {
        const {rows} = await db.query('insert into product (name, description, tagid, brandid, categoryid) values($1, $2, $3, $4, $5) returning id', [name, description, tagid, brandid, categoryid]);
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
})


apiRouter.get("/sizes", async (req, res, next) => {
    mrValidate(next, req, res);
    try {
        const {rows} = await db.query('select * from size');
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
})


apiRouter.post("/createSize", [stringValidate('name'), stringValidate('short'),  stringValidate('size'), stringValidate('unit')], async (req, res, next) => {
    mrValidate(next, req, res);
    const { name, short, size, unit } = req.body;
    try {
        const {rows} = await db.query('insert into size (name, short, size, unit) values($1, $2, $3, $4) returning id', [name, short, size, unit]);
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
})

apiRouter.get("/colors", async (req, res, next) => {
    mrValidate(next, req, res);
    try {
        const {rows} = await db.query('select * from color');
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
})

apiRouter.post("/createColor", [stringValidate('name'), stringValidate('code')], async (req, res, next) => {
    mrValidate(next, req, res);
    const { name, code } = req.body;
    try {
        const {rows} = await db.query('insert into color (name, code) values($1, $2) returning id', [name, code]);
        return res.json(rows)
    } catch (e) {
        return mrError(next, res, e.detail)
    }
})


apiRouter.post("/createStock", [uuidValidate('productid'), uuidValidate('sizeid'), uuidValidate('genderid'), uuidValidate('colorid'), numberValidate('count'), numberValidate('price')], async (req, res, next) => {
    mrValidate(next, req, res);
    const {productid, sizeid, genderid, colorid, count, price } = req.body; 
    let result = [];
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
})




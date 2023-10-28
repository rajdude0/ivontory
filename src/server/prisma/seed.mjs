import { PrismaClient } from '@prisma/client'
import  { permissionsEnums, taggingEffectTypes } from "../lib/enums.js";
import  { config } from "dotenv";

config();
const prisma = new PrismaClient();


async function seedPermissions() {
  const permsWithId = {};
    for( let [key, perm] of Object.entries(permissionsEnums)) {
        const res = await prisma.permissions.upsert({
          where: {
            name: perm
          },
          update: {  },
          create : {
            name: perm
          }
        })
        permsWithId[perm] = res.id;
    }
    return permsWithId;
}

async function users(permsWithId) {
  const defaultUser = process.env.DEFAULT_USER;
  const defaultUserPassword = process.env.DEFAULT_USER_PASSWORD
  return await prisma.users.upsert({
    where: {
      username: defaultUser
    },
    update: {},
    create: {
      username: defaultUser,
      email: "admin@ivontory.com",  
      password: defaultUserPassword,
      phoneno: "+977 9842600000",
      permissison: {
        connect: {id: permsWithId[permissionsEnums.ADMIN]}
      }
    },
    include: {
      permissison: true
    }
  }).then(({ id, username, email, phoneno, permissionid}) => ({ id, username, email, phoneno, permissionid}))
}


async function seedBrands() {
  const topBrands = [
    {name: "Nike", origin: "USA" },
    {name: "Reebok", origin: "USA"},
    {name: "Puma", origin: "USA"},
    {name: "Adidas", origin: "USA"}
  ]
  
  return await prisma.brands.createMany({
      data: topBrands,
      skipDuplicates: true
  });
  
}

async function seedCategory() {
  const topCategories = [
    {name: "T-Shirt"},
    {name: "Jeans"},
    {name: "Pants"},
    {name: "Jacket"}
  ]
  return await prisma.category.createMany({
    data: topCategories,
    skipDuplicates: true
  })
}

async function seedGender() {
  const genders = [
    {name: "Male", short: "M"},
    {name: "Female", short: "F"},
    {name: "LGBTQ+", short: "L"}
  ]
  return await prisma.gender.createMany({
    data: genders,
    skipDuplicates: true
  })
}

async function seedTags() {
  const generalTags = [
    {name: "Sale", effecttype: taggingEffectTypes.PERCENT_OFF, effectvalue: 15},
    {name: "IVONNEW24", effecttype: taggingEffectTypes.NUMBER_OFF, effectvalue: 50}
  ]
  return await prisma.tags.createMany({
    data: generalTags,
    skipDuplicates: true
  })
}

async function seedSize() {
  const sizes = [
    {name: "Small", short: "S", size: "28", unit: "UK"},
    {name: "Medium", short: "M", size: "32", unit: "UK"},
    {name: "Large", short: "L", size: "34", unit: "UK"},
    {name: "Extra Large", short: "XL", size: "36", unit: "UK"}
  ]
  return await prisma.size.createMany({
    data: sizes,
    skipDuplicates: true,
  })
}

async function seedColor() {
  const colors = [
    {name: "White", code: "#ffffff"},
    {name: "Black", code: "#000000"}
  ]

  return await prisma.color.createMany({
    data: colors,
    skipDuplicates: true
  });
}

async function seedSizeGender(sizeid, genderid) {

  return await prisma.sizeGender.upsert({
    create: {
      gender: {
        connect: {id: genderid}
      },
      size: {
        connect: {id: sizeid}
      }
    },
    update: {},
    where: {
      sizeid_genderid: {
        sizeid: sizeid,
        genderid: genderid
      }
    }
  }).then(data => data.id); 
}

async function seedSizeColor(sizegenderid, colorid) {
  
  return await prisma.sizeColor.upsert({
    create: {
      sizegender: {
        connect: { id: sizegenderid}
      }, 
      color: {
        connect: { id : colorid}
      }      
    },
    update: {

    },
    where: {
      colorid_sizegenerid: {
        colorid: colorid,
        sizegenerid: sizegenderid
      }
    }
  }).then(data => data.id);
}

async function seedProduct(brandid, categoryid) {
    return prisma.product.upsert({
      where: {
        name: "Nike White T-Shirt"
      },
      create: {
        name: "Nike White T-Shirt",
        description: "Cotton Nike T-Shirt 100% Cotton.",
        category: {
          connect: { id: categoryid}
        },
        brand: {
          connect: {id: brandid}
        }
      },
      update: {}
      
    }).then(data => data.id);
}


async function seedSKUwithImages(productid, sizecolorid) {

  const images = ["-MvrMwlotZx_Bzxz7HVlT-f2450aa4db175234e983cd5a33b5c0f3.jpg", "-yDLDxCrr47qJ4X1Qq8Uw-5a36294edb9bbb0d747817da00e4140d", "0tkFUrakn-sC4WQBmGRI1-6b9f65213a981660aff5d7c2a5217321"]

  return prisma.sKU.upsert({
    where: {
      productid_sizecolorid: {
        productid,
        sizecolorid
      }
    },
    create: {
      product: {
        connect: {
          id: productid
        }
      },
      sizecolor: {
        connect: {
          id: sizecolorid
        }
      },
      images: {
        create: {
          path: images
        }
      }
    },
    update: {}
  }).then(({ id }) => id)
}

async function seedStock(skuid) {
  return prisma.stock.upsert({
    where: {
      skuid
    },
    update: {},
    create: {
      count: 10,
      price: 3000,
      sku: {
        connect: {
          id: skuid
        }
      }  
    } 
  }).then(({id}) => id)
}


async function main() {

 const permsWithId  = await seedPermissions();
 const userid = await users(permsWithId);
 const brandCounts = await seedBrands();
 const categoryCount = await seedCategory();
 const tshirtCategoryId = await prisma.category.findFirst({
  where: {
    name: "T-Shirt",
  }
 }).then(data => data.id);

 const nikeBrandId = await prisma.brands.findFirst({
  where: {
    name: "Nike"
  }
 }).then(data => data.id);

 const genderCount = await seedGender();
 const tagsCount = await seedTags();
 const sizeCount = await seedSize();
 const smallSizeId = await prisma.size.findFirst({
  where: {
    name: "Small"
  }
  }).then(data => data.id);

  const maleGenderId = await prisma.gender.findFirst({
    where: {
      name: "Male"
    }
  }).then(data => data.id);

 const sizegenderId = await seedSizeGender(smallSizeId, maleGenderId);

 const colorscount = await seedColor();

 const whiteColorId = await prisma.color.findFirst({
  where: {
    name: "White"
  }
 }).then(data => data.id);


 const sizecolorid = await seedSizeColor(sizegenderId, whiteColorId);

 const productId = await seedProduct(nikeBrandId, tshirtCategoryId);
 const skuid = await seedSKUwithImages(productId, sizecolorid);
 const stockid = await seedStock(skuid);
 console.log(stockid)

 const productDetail = await prisma.stock.findMany({
    where: {
      skuid: skuid
    },
    include: {
      sku: {
        include: {
          images: true,
          sizecolor: {
            include: {
              sizegender: {
                include: {
                  size: true,
                  gender: true
                }
              },
              color: true
            }
          },
          product: {
            include: {
              category: true,
              brand: true
            }
          },
        }
      }
    }
 })

 console.log(JSON.stringify(productDetail), null, 2)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
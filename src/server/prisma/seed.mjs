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
    skipDuplicates: true
  })
}

async function seedProduct() {

}

async function main() {

 const permsWithId  = await seedPermissions();
 const userid = await users(permsWithId);
 const brandCounts = await seedBrands();
 const categoryCount = await seedCategory();
 const genderCount = await seedGender();
 const tagsCount = await seedTags();
 const sizeCount = await seedSize();
 console.log(sizeCount)
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
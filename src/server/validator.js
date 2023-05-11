import { check } from "express-validator";

export const stringValidate = (key)  => check(key, 'Should be a non empty string').isString().notEmpty().trim().escape();

export const uuidValidate = (key) => check(key, 'Should be a valid uuid').trim().matches(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/).escape();

export const numberValidate = (key) => check(key, "Should be a valid number").trim().notEmpty().isNumeric();

export const objectValidate = (key) => check(key, "Should be a vaild object").isObject().notEmpty();

export const arrayValidate = (key) => check(key, "Should be a vaild object").isArray().notEmpty();
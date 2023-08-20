
--- create database ivontory;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- permissions can be "admin, user, guest, moderator,"

create table permissions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text not null
);


create table users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    username text not null unique,
    email text not null unique,
    password text not null,
    salt text not null,
    phoneno text, 
    permissionid uuid REFERENCES permissions(id)
);

create table tags (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text not null unique,
    effecttype text,
    effectvalue float 
);


create table brands (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text not null unique,
    origin text
);

create table category (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text not null unique
);

create table gender (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text not null unique,
    short text not null unique
);

create table product (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text not null unique,
    description text,
    tagid uuid REFERENCES tags(id),
    brandid uuid not null REFERENCES brands(id),
    categoryid uuid not null REFERENCES category(id)
);


create table size (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text not null,
    short text not null,
    size text not null,
    unit text not null
);


create table sizegender (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    sizeid uuid not null REFERENCES size(id),
    genderid uuid not null REFERENCES gender(id)
);

create table color (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text not null unique,
    code text not null unique
);


create table sizecolor (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    sizegenderid uuid not null REFERENCES sizegender(id),
    colorid uuid not null REFERENCES color(id)
);

create table images (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    path text[],
    productid uuid not null REFERENCES product(id),
    sizecolorid uuid not null REFERENCES sizecolor(id)
);

create table stock (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    productid uuid not null REFERENCES product(id),
    sizecolorid uuid not null REFERENCES sizecolor(id),
    count decimal,
    price decimal
);



--- seed data

insert into permissions(name) values ('admin');
insert into permissions(name) values ('user');
insert into permissions(name) values ('guest');
insert into permissions(name) values ('moderator');
insert into users(username, email, password, salt, phoneno, permissionid) values('admin', 'admin@multiverinventory.com', 'a402ab7f9309c77bbf1f2ee99746aa39' , '+100000000', (select id from permissions where name='admin'));
insert into brands (name, origin) values ('Nike', 'USA'), ('Reebok', 'USA'), ('Puma', 'USA');
insert into category (name) values ('Shirt'), ('Pants'), ('Perfumes');
insert into gender (name, short) values ('Male', 'M'), ('Female', 'F'), ('Unisex', 'U');
insert into color (name, code) values ('White', '#ffffff'), ('Black', '#000000'), ('Orange', '##FFA500');
insert into size (name, short, size, unit) values ('Small', 'S', '30-32', 'inch'), ('Medium', 'M', '32-34', 'inch'), ('Large', 'L', '38-42', 'inch');
insert into sizegender (sizeid, genderid) values ((select id from size where short='M'), (select id from gender where short='M')), ((select id from size where short='S'), (select id from gender where short='F'));
insert into sizecolor (sizegenderid, colorid) values ((select id from sizegender where sizeid=(select id from size where short='M')),(select id from color where name='White'));

insert into product (name, description, brandid, categoryid) values ('T-Shirt V Neck Full Sleeves', 'Fully made out cotton fabric imported from France, 100% original', (select id from brands where name='Nike'), (select id from category where name='Shirt'));


select product.name, color.name as Color, price, size.name from product inner join stock on product.id = stock.productid inner join sizecolor on sizecolorid = stock.sizecolorid inner join color on color.id = sizecolor.colorid inner join sizegender on sizegender.id=sizecolor.sizegenderid inner join size on size.id=sizegender.sizeid;select product.name, stock.price, stock.count, color.name as color, size.name from product inner join stock on product.id = stock.productid inner join sizecolor on sizecolor.id = stock.sizecolorid inner join sizegender on sizegender.id = sizecolor.sizegenderid inner join color on color.id = sizecolor.colorid inner join gender on gender.id = sizegender.genderid inner join size on size.id = sizegender.sizeid
create extension if not exists "uuid-ossp";

drop table if exists stocks;
drop table if exists products;

create table products (
	id uuid primary key default uuid_generate_v4(),
	title text not null,
	description text,
	image text,
	price integer
);

create table stocks (
	product_id uuid,
	count integer,
	foreign key ("product_id") references "products" ("id")
);

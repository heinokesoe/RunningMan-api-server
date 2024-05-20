CREATE TABLE episodes (
  episode TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  link TEXT NOT NULL
);
INSERT INTO episodes SELECT 
  json_extract(value, '$.episode'), 
  json_extract(value, '$.title'), 
  json_extract(value, '$.link')
FROM json_each(readfile('data.json'));

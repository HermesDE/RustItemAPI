# Rust Items API

A RESTful API for querying data about Rust items, including crafting recipes, durability, loot tables, and more. This API is designed to provide detailed and structured information for developers building tools or applications related to Rust.

## Table of Contents

1. [Introduction](#introduction)
2. [API Endpoints](#api-endpoints)
   - [GET /items](#get-items)
   - [GET /craft](#get-craft)
   - [GET /durability](#get-durability)
   - [GET /loot](#get-loot)
   - [GET /recycle](#get-recycle)
   - [GET /shopping](#get-shopping)
   - [GET /deployable](#get-deployable)
   - [GET /weapons](#get-weapons)
3. [Explaining the Data](#explaining-the-data)
4. [How to Use](#how-to-use)
5. [Examples](#examples)

## Introduction

This API allows you to query detailed information about Rust items. Each endpoint provides access to different types of data, such as crafting recipes, item durability, loot chances, and recycling details. This README provides a comprehensive overview of the available endpoints, the columns they can access, and the supported operations for each column.

## API Endpoints

### GET /items

Retrieve information about Rust items.

| Column                 | Type   | Allowed Comparators               |
|------------------------|--------|-----------------------------------|
| id                     | Int    | EQUALS, GT, LT, IN, CONTAINS      |
| name                   | String | EQUALS, CONTAINS, IN              |
| image_url              | String | EQUALS, CONTAINS, IN              |
| identifier             | Int    | EQUALS, GT, LT, IN, CONTAINS      |
| stack_size             | Int    | EQUALS, GT, LT, IN, CONTAINS      |
| despawn_time           | Int    | EQUALS, GT, LT, IN, CONTAINS      |
| is_projectile_weapon   | Bool   | EQUALS                            |
| is_melee_weapon        | Bool   | EQUALS                            |
| is_deployable          | Bool   | EQUALS                            |
| is_consumable          | Bool   | EQUALS                            |

---

### GET /craft

Retrieve crafting recipes for Rust items.

| Column               | Type   | Allowed Comparators         |
|----------------------|--------|-----------------------------|
| item_id              | Int    | EQUALS, GT, LT, IN, CONTAINS|
| result_item          | String | EQUALS, CONTAINS, IN        |
| result_amount        | Int    | EQUALS, GT, LT, IN, CONTAINS|
| ingredients          | JSON   | CONTAINS                    |
| ingredients_recursive| JSON   | CONTAINS                    |

---

### GET /durability

Retrieve durability information for Rust items.

| Column             | Type   | Allowed Comparators          |
|--------------------|--------|------------------------------|
| item_id            | Int    | EQUALS, IN, GT, LT, CONTAINS |
| durability_type    | String | EQUALS, CONTAINS, IN         |
| category           | String | EQUALS, CONTAINS, IN         |
| tool               | String | EQUALS, CONTAINS, IN         |
| quantity           | Int    | EQUALS, GT, LT, IN, CONTAINS |
| time               | Int    | EQUALS, GT, LT, IN, CONTAINS |
| fuel               | Int    | EQUALS, GT, LT, IN, CONTAINS |
| sulfur             | Int    | EQUALS, GT, LT, IN, CONTAINS |

---

### GET /loot

Retrieve loot table information for Rust items.

| Column       | Type   | Allowed Comparators          |
|--------------|--------|------------------------------|
| item_id      | Int    | EQUALS, IN, GT, LT, CONTAINS |
| container    | String | EQUALS, CONTAINS, IN         |
| condition    | Range  | EQUALS, GT, LT, CONTAINS     |
| amount       | Range  | EQUALS, GT, LT, CONTAINS     |
| chance       | Int    | EQUALS, GT, LT, IN, CONTAINS |

---

### GET /recycle

Retrieve recycling information for Rust items.

| Column         | Type   | Allowed Comparators                |
|----------------|--------|------------------------------------|
| item_id        | Int    | EQUALS, IN, GT, LT, CONTAINS       |
| recycler_name  | String | EQUALS, CONTAINS, IN               |
| yield          | JSON   | CONTAINS                           |
| efficiency     | Double  | EQUALS, GT, LT                    |

---

### GET /shopping

Retrieve shopping information for Rust items.

| Column         | Type   | Allowed Comparators           |
|----------------|--------|-------------------------------|
| item_id        | Int    | EQUALS, GT, LT, IN, CONTAINS  |
| shop_name      | String | EQUALS, CONTAINS, IN          |
| for_sale_item  | String | EQUALS, CONTAINS, IN          |
| for_sale_amount| Int    | EQUALS, GT, LT, IN, CONTAINS  |
| cost_item      | String | EQUALS, CONTAINS, IN          |
| cost_amount    | Int    | EQUALS, GT, LT, IN, CONTAINS  |

---

### GET /deployable

Retrieve deployable item information for Rust items.

| Column       | Type   | Allowed Comparators              |
|--------------|--------|----------------------------------|
| item_id      | Int    | EQUALS, IN, GT, LT, CONTAINS     |
| upkeep       | Range  | EQUALS, GT, LT                   |
| hp           | Int    | EQUALS, IN, GT, LT, CONTAINS     |
| decay        | Int    | EQUALS, IN, GT, LT, CONTAINS     |

### GET /weapons

Retrieve weapon information for Rust items.

| Column       | Type   | Allowed Comparators              |
|--------------|--------|----------------------------------|
| item_id      | Int    | EQUALS, IN, GT, LT, CONTAINS     |
| damage       | Int    | EQUALS, GT, LT, IN, CONTAINS     |
| attack_speed | Int    | EQUALS, GT, LT, IN, CONTAINS     |
| attack_range | Double | EQUALS, GT, LT, IN, CONTAINS     |
| draw         | Double | EQUALS, GT, LT, IN, CONTAINS     |
| throw        | Bool   | EQUALS                           |
| rate_of_fire | Int    | EQUALS, GT, LT, IN, CONTAINS     |
| aim_cone     | Double | EQUALS, GT, LT, IN, CONTAINS     |
| capacity     | Int    | EQUALS, GT, LT, IN, CONTAINS     |
| reload       | Double | EQUALS, GT, LT, IN, CONTAINS     |

---


## Explaining the Data

### Items Table
- **name**: The name of the item. Example: "Assault Rifle".
- **image_url**: URL of the item's image. Example: "http://example.com/image.png".
- **identifier**: Rust's unique identifier for the item. Example: "567235583".
- **stack_size**: Maximum stack size for the item. Example: 100.
- **despawn_time**: Time in seconds before the item despawns. Example: 3600.
- **is_projectile_weapon**: Whether the item is a projectile weapon. Example: true.
- **is_melee_weapon**: Whether the item is a melee weapon. Example: false.
- **is_deployable**: Whether the item is deployable. Example: true.
- **is_consumable**: Whether the item is consumable. Example: false.

### Craft Table
- **item_id**: ID of the item. Has no in-game bearing, just used for item database lookups. Example: 123.
- **result_item**: The item produced by crafting. Example: "Wooden Door".
- **result_amount**: Amount of the result item produced. Example: 5.
- **ingredients**: Ingredients required for crafting. 
Example for Ladder Hatch: "Wood, Metal Fragments".
```sh
{
    [
        {
            "item":"Wooden Ladder","amount":1
        },
        {
            "item":"Metal Fragments","amount":"300"
        },
        {
            "item":"Gears","amount":"3"
        }
        ]
}
```
- **ingredients_recursive**: Total Ingredients needed if you were to craft ingredients needed in the recipe. Example for Ladder Hatch:
```sh
{
    [
        {
            "item":"Metal Fragments","amount":"375"
        },
        {
            "item":"Wood","amount":"300"
        },
        {
            "item":"Rope","amount":"3 ft"
        },
        {
            "item":"Scrap","amount":"300"
        }
    ]
}
```

### Durability Table
- **item_id**: ID of the item. Example: 123.
- **durability_type**: Type of durability. Example: "hard" or "soft".
- **category**: Category of the item. Example: "explosive", "torpedo", "melee", "explosive", "thrown", "guns".
- **tool**: Tool associated with the item. Example: "Rocket" ,"Torpedo", "Rock", "Thompson", etc.
- **quantity**: Quantity of the tool needed to break item. Example: 10.\
Quantity sometimes occurs in this format for the guns category so be careful, this may change as it isn't quite desirable:

```sh
{
    "ammo": "Explosive 5.56 Rifle Ammo", 
    "quantity": "250"
}
```
- **time**: Time it takes to break item. Example: "3600".
- **fuel**: Fuel associated with the item. Example: 100.
- **sulfur**: Amount of sulfur. Example: 100.

### Loot Table
- **item_id**: ID of the item. Example: 123.
- **container**: Container where the item can be found. Example: "APC Crate", "Treasure Box".
- **condition**: Condition of the item in percent. Example: "100", "10-20", "-".
- **amount**: Amount of the item. Example: "10-20", "1".
- **chance**: Chance of the item appearing in percent. Example: "10", ".05".

### Recycle Table
- **item_id**: ID of the item. Example: 123.
- **recycler_name**: Name of the recycler. Example: "Recycler", "Safe Zone Recycler".
- **yield**: Yield from recycling. Example: 10.
- **efficiency**: Efficiency of the recycler. Example: 0.6 or 0.4. Make sure to include the 0 before the period in your requests.

### Deployable Table
- **item_id**: ID of the item. Example: 123.
- **upkeep**: Necessary materials for upkeep range for the deployable item. Example: "10-20".
- **hp**: Hit points of the deployable item. Example: 500.
- **decay**: Decay rate of the deployable item. Example: 60.

### Shopping Table
- **item_id**: ID of the item. Example: 123.
- **shop_name**: Name of the shop. Example: "Outpost Shop", "Bandit Camp".
- **for_sale_item**: Item being sold. Example: "Wood", "Scrap".
- **for_sale_amount**: Amount of the item being sold. Example: 1000.
- **cost_item**: Item required for purchase. Example: "Scrap", "Cloth".
- **cost_amount**: Amount of the cost item required. Example: 20.

### Weapons Table
- **item_id**: ID of the item. Example: 123.
- **damage**: Damage dealt by the weapon. Example: "50".
- **attack_speed**: Speed of attack for the weapon in hits per minute. Example: "50".
- **attack_range**: Range of the weapon in meters. Example: "1.5".
- **draw**: Draw time in seconds for bows or charge time for other weapons. Example: "1.0".
- **throw**: Whether the weapon can be thrown. Example: "true" or "false".
- **rate_of_fire**: Rate of fire for the weapon in RPM. Example: "600".
- **aim_cone**: Accuracy cone of the weapon in degrees. Example: "0.2".
- **capacity**: Ammo capacity of the weapon. Example: "30".
- **reload**: Reload time of the weapon in seconds. Example: "3.0".

---

## How to Use
You can craft your queries using filters and columns. Each column supports specific comparators like `EQUALS`, `CONTAINS`, `GT`, `LT`, and `IN`. Logical operations such as `AND`, `OR`, `XOR`, `NOR`, and `NAND` can be applied to combine multiple filters. Default operation is `AND`. If you do not specify any columns, all columns will be fetched by default.

Even when querying a table besides the Items table, columns from Items will always be valid and can be used as a way of bypassing intermediate steps. (See examples 3-5).

Additional query parameters:

- **limit**: Specify the maximum number of results to return (default: 20, maximum: 100)
- **offset**: Specify the number of results to skip (default: 0)
- **orderBy**: Specify the order of the results

Note that for Range typed queries, `LT` will compare with the right side of range and `GT` the left side of range and `EQUALS` will return true if the value falls in the range, endpoints inclusive. Also note that `CONTAINS` is case insensitive but `EQUALS` isn't. Lastly, JSON typed queries are just json dumped into a string.

### Ordering Results

You can order the results using the `orderBy` parameter. The format is a JSON array of order objects:

```json
[
    {
        "order1": {
            "column": "column_name",
            "descending": false
        }
    },
    {
        "order2": {
            "column": "another_column",
            "descending": true
        }
    }
]
```

Each object in the array represents an ordering rule. The keys ("order1", "order2", etc.) are arbitrary and used for structure.
"column" specifies which column to order by.
"descending" is a boolean: false for ascending order, true for descending order.
Multiple ordering rules are applied in the order they appear in the array.

---

# Examples

## 1. Select everything from the `items` table where `name` contains "Rifle"

## cURL:
```sh
curl -G "http://localhost:3000/api/items" \
    --data-urlencode "filters={\"name\":{\"column\":\"name\",\"comparator\":\"CONTAINS\",\"value\":\"Rifle\"}}"   
```

## JavaScript (fetch):
```js
const url = new URL('http://localhost:3000/api/items');
url.searchParams.append('filters', JSON.stringify({
  name: { column: 'name', comparator: 'CONTAINS', value: 'Rifle' }
}));

fetch(url)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## Python (requests):
```py
import requests
import json

url = 'http://localhost:3000/api/items'
params = {
    'filters': json.dumps({
        'name': {'column': 'name', 'comparator': 'CONTAINS', 'value': 'Rifle'}
    })
}

response = requests.get(url, params=params)
print(response.json())
```

## Result:
```json
[
    {
        "id":90,
        "name":"Assault Rifle",
        "image_url":"https://wiki.rustclash.com/img/items40/rifle.ak.png",
        "identifier":"1545779598",
        "stack_size":"1",
        "despawn_time":"3600",
        "is_projectile_weapon":1,
        "is_melee_weapon":0,
        "is_deployable":0,
        "is_consumable":0
    },
    {
        "id":92,
        "name":"Bolt Action Rifle",
        "image_url":"https://wiki.rustclash.com/img/items40/rifle.bolt.png",
        "identifier":"1588298435",
        "stack_size":"1",
        "despawn_time":"3600",
        "is_projectile_weapon":1,
        "is_melee_weapon":0,
        "is_deployable":0,
        "is_consumable":0
    },
    ...
]
```
<br />

## 2. Get `image_url` from the `items` table where `is_deployable` is true or the `name` contains "pistol"

## cURL:
```sh
curl -G "http://localhost:3000/api/items" \
    --data-urlencode "filters={\"is_deployable\":{\"column\":\"is_deployable\",\"comparator\":\"EQUALS\",\"value\":true},\"name\":{\"column\":\"name\",\"comparator\":\"CONTAINS\",\"value\":\"pistol\"}}" \
    --data-urlencode "columns=[\"image_url\"]" \
    --data-urlencode "logicalOp=OR"
```
## JavaScript (fetch):
```js
const url = new URL('http://localhost:3000/api/items');
url.searchParams.append('filters', JSON.stringify({
  is_deployable: { column: 'is_deployable', comparator: 'EQUALS', value: true },
  name: { column: 'name', comparator: 'CONTAINS', value: 'pistol' }
}));
url.searchParams.append('columns', JSON.stringify(['image_url']));
url.searchParams.append('logicalOp', 'OR');

fetch(url)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## Python (requests):
```py
import requests
import json

url = 'http://localhost:3000/api/items'
params = {
    'filters': json.dumps({
        'is_deployable': {'column': 'is_deployable', 'comparator': 'EQUALS', 'value': True},
        'name': {'column': 'name', 'comparator': 'CONTAINS', 'value': 'pistol'}
    }),
    'columns': json.dumps(['image_url']),
    'logicalOp': 'OR'
}

response = requests.get(url, params=params)
print(response.json())
```

## Result:
```json
[
    {
        "image_url":"https://wiki.rustclash.com/img/items40/pistol.eoka.png"
    },
    {
        "image_url":"https://wiki.rustclash.com/img/items40/pistol.m92.png"
    },
    {
        "image_url":"https://wiki.rustclash.com/img/items40/pistol.semiauto.png"
    },
    {
        "image_url":"https://wiki.rustclash.com/img/items40/pistol.water.png"
    },
    {
        "image_url":"https://wiki.rustclash.com/img/items40/door.hinged.toptier.png"
    },
    ...
]
```
<br> </br>

## 3. Retrieve item details in two parts
- First, get the `item_id` from the `items` table where the `name` is "Wooden Wall".

## cURL:
```sh
curl -G "http://localhost:3000/api/items" \
    --data-urlencode "filters={\"name\":{\"column\":\"name\",\"comparator\":\"EQUALS\",\"value\":\"Wooden Wall\"}}" \
    --data-urlencode "columns=[\"id\"]" 
```

## JavaScript (fetch):
```js
const url = new URL('http://localhost:3000/api/items');
url.searchParams.append('filters', JSON.stringify({
  name: { column: 'name', comparator: 'EQUALS', value: 'Wooden Wall' }
}));
url.searchParams.append('columns', JSON.stringify(['id']));

fetch(url)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## Python (requests):
```py
import requests
import json

url = 'http://localhost:3000/api/items'
params = {
    'filters': json.dumps({
        'name': {'column': 'name', 'comparator': 'EQUALS', 'value': 'Wooden Wall'}
    }),
    'columns': json.dumps(['id'])
}

response = requests.get(url, params=params)
print(response.json())
```

## Result:
```json
[
    {
        "id":921
    }
]
```
<br> </br>
- Second, use that `item_id` to get `quantity`, `time`, and `sulfur` from the `durability` table where `item_id` matches, `durability_type` is 'hard', `category` is 'explosive', and `tool` is 'Rocket'. Note that 921 will not always be the id for Wooden Wall.
## cURL:
```sh
curl -G "http://localhost:3000/api/durability" \
    --data-urlencode "filters={\"item_id\":{\"column\":\"item_id\",\"comparator\":\"EQUALS\",\"value\":921},\"durability_type\":{\"column\":\"durability_type\",\"comparator\":\"EQUALS\",\"value\":\"hard\"},\"category\":{\"column\":\"category\",\"comparator\":\"EQUALS\",\"value\":\"explosive\"},\"tool\":{\"column\":\"tool\",\"comparator\":\"EQUALS\",\"value\":\"Rocket\"}}" \
    --data-urlencode "columns=[\"quantity\",\"time\",\"sulfur\"]"\
    --data-urlencode "logicalOp=AND"
```

## JavaScript (fetch):
```js
const url = new URL('http://localhost:3000/api/durability');
url.searchParams.append('filters', JSON.stringify({
  item_id: { column: 'item_id', comparator: 'EQUALS', value: 921 },
  durability_type: { column: 'durability_type', comparator: 'EQUALS', value: 'hard' },
  category: { column: 'category', comparator: 'EQUALS', value: 'explosive' },
  tool: { column: 'tool', comparator: 'EQUALS', value: 'Rocket' }
}));
url.searchParams.append('columns', JSON.stringify(['quantity', 'time', 'sulfur']));
url.searchParams.append('logicalOp', 'AND');

fetch(url)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## Python (requests):
```py
import requests
import json

url = 'http://localhost:3000/api/durability'
params = {
    'filters': json.dumps({
        'item_id': {'column': 'item_id', 'comparator': 'EQUALS', 'value': 921},
        'durability_type': {'column': 'durability_type', 'comparator': 'EQUALS', 'value': 'hard'},
        'category': {'column': 'category', 'comparator': 'EQUALS', 'value': 'explosive'},
        'tool': {'column': 'tool', 'comparator': 'EQUALS', 'value': 'Rocket'}
    }),
    'columns': json.dumps(['quantity', 'time', 'sulfur']),
    'logicalOp': 'AND'
}

response = requests.get(url, params=params)
print(response.json())
```
## Result:
```json
[
    {
        "quantity":"2",
        "time":"6",
        "sulfur":"2800"
    }
]
```
<br> </br>

## 4. Get durability information for "Wooden Wall" using item name directly

This example demonstrates how to bypass the two-step query process by using the item name directly in the durability table query.

## cURL:
```sh
curl -G "http://localhost:3000/api/durability" \
    --data-urlencode "filters={\"name\":{\"column\":\"name\",\"comparator\":\"EQUALS\",\"value\":\"Wooden Wall\"},\"durability_type\":{\"column\":\"durability_type\",\"comparator\":\"EQUALS\",\"value\":\"hard\"},\"category\":{\"column\":\"category\",\"comparator\":\"EQUALS\",\"value\":\"explosive\"},\"tool\":{\"column\":\"tool\",\"comparator\":\"EQUALS\",\"value\":\"Rocket\"}}" \
    --data-urlencode "columns=[\"quantity\",\"time\",\"sulfur\"]"\
    --data-urlencode "logicalOp=AND"
```

## JavaScript (fetch):
```js
const url = new URL('http://localhost:3000/api/durability');
url.searchParams.append('filters', JSON.stringify({
  name: { column: 'name', comparator: 'EQUALS', value: 'Wooden Wall' },
  durability_type: { column: 'durability_type', comparator: 'EQUALS', value: 'hard' },
  category: { column: 'category', comparator: 'EQUALS', value: 'explosive' },
  tool: { column: 'tool', comparator: 'EQUALS', value: 'Rocket' }
}));
url.searchParams.append('columns', JSON.stringify(['quantity', 'time', 'sulfur']));
url.searchParams.append('logicalOp', 'AND');

fetch(url)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## Python (requests)
```py
import requests
import json

url = 'http://localhost:3000/api/durability'
params = {
    'filters': json.dumps({
        'name': {'column': 'name', 'comparator': 'EQUALS', 'value': 'Wooden Wall'},
        'durability_type': {'column': 'durability_type', 'comparator': 'EQUALS', 'value': 'hard'},
        'category': {'column': 'category', 'comparator': 'EQUALS', value: 'explosive'},
        'tool': {'column': 'tool', 'comparator': 'EQUALS', 'value': 'Rocket'}
    }),
    'columns': json.dumps(['quantity', 'time', 'sulfur']),
    'logicalOp': 'AND'
}

response = requests.get(url, params=params)
print(response.json())
```

## Result:
```json
[
  {
    "quantity": "2",
    "time": "6",
    "sulfur": "2800"
  }
]
```

<br> </br>

## 5. Get item names for durability entries with quantity greater than 8 and tool = 'Rocket'

This example shows how to retrieve item information (name) while querying the durability table with multiple conditions.

## cURL:
```sh
curl -G "http://localhost:3000/api/durability" \
    --data-urlencode "filters={\"quantity\":{\"column\":\"quantity\",\"comparator\":\"GT\",\"value\":8},\"tool\":{\"column\":\"tool\",\"comparator\":\"EQUALS\",\"value\":\"Rocket\"}}" \
    --data-urlencode "columns=[\"name\"]" \
    --data-urlencode "logicalOp=AND"
```

## JavaScript (fetch):
```js
const url = new URL('http://localhost:3000/api/durability');
url.searchParams.append('filters', JSON.stringify({
  quantity: { column: 'quantity', comparator: 'GT', value: 8 },
  tool: { column: 'tool', comparator: 'EQUALS', value: 'Rocket' }
}));
url.searchParams.append('columns', JSON.stringify(['name']));
url.searchParams.append('logicalOp', 'AND');

fetch(url)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## Python (requests):
```py
import requests
import json

url = 'http://localhost:3000/api/durability'
params = {
    'filters': json.dumps({
        'quantity': {'column': 'quantity', 'comparator': 'GT', 'value': 8},
        'tool': {'column': 'tool', 'comparator': 'EQUALS', 'value': 'Rocket'}
    }),
    'columns': json.dumps(['name']),
    'logicalOp': 'AND'
}

response = requests.get(url, params=params)
print(response.json())
```

## Result:
```json
[
  { "name": "Vending Machine" },
  { "name": "Armored Foundation" },
  { "name": "Armored Roof" },
  { "name": "Armored Low Wall" },
  { "name": "Armored Floor" },
  { "name": "Armored Doorway" },
  { "name": "Armored Window" },
  { "name": "Armored Steps" },
  { "name": "Armored Floor Triangle" },
  { "name": "Armored Triangle Foundation" }
]

```

## 6. Get items with `name` containing "Rifle", `ordered by` `name` ascending, `limit` 5 results

## cURL:
```sh
curl -G "http://localhost:3000/api/items" \
    --data-urlencode "filters={\"name\":{\"column\":\"name\",\"comparator\":\"CONTAINS\",\"value\":\"Rifle\"}}" \
    --data-urlencode "columns=[\"name\"]"\
    --data-urlencode "orderBy=[{\"order1\":{\"column\":\"name\",\"descending\":false}}]" \
    --data-urlencode "limit=5"
```

## JavaScript (fetch):
```js
const url = new URL('http://localhost:3000/api/items');
url.searchParams.append('filters', JSON.stringify({
  name: { column: 'name', comparator: 'CONTAINS', value: 'Rifle' }
}));
url.searchParams.append('columns', JSON.stringify(['name']));
url.searchParams.append('orderBy', JSON.stringify([{ order1: { column: 'name', descending: false } }]));
url.searchParams.append('limit', '5');

fetch(url)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## Python (requests):
```py
import requests
import json

url = 'http://localhost:3000/api/items'
params = {
    'filters': json.dumps({
        'name': {'column': 'name', 'comparator': 'CONTAINS', 'value': 'Rifle'}
    }),
    'columns': json.dumps(['name']),
    'orderBy': json.dumps([{'order1': {'column': 'name', 'descending': False}}]),
    'limit': '5'
}

response = requests.get(url, params=params)
print(response.json())
```
## Result:
```json
[
  {
    "name": "5.56 Rifle Ammo"
  },
  {
    "name": "Assault Rifle"
  },
  {
    "name": "Bolt Action Rifle"
  },
  {
    "name": "Explosive 5.56 Rifle Ammo"
  },
  {
    "name": "HV 5.56 Rifle Ammo"
  }
]

```
<br> </br>

## 5. Get `image_url` of items with `name` in array

## cURL:
```sh
curl -G "http://localhost:3000/api/items" \
    --data-urlencode "filters={\"name\":{\"column\":\"name\",\"comparator\":\"IN\",\"value\":[\"5.56 Rifle Ammo\",\"Assault Rifle\",\"Bolt Action Rifle\",\"Explosive 5.56 Rifle Ammo\",\"HV 5.56 Rifle Ammo\"]}}"\
    --data-urlencode "columns=[\"image_url\"]"
```

## JavaScript (fetch):
```js
const url = new URL('http://localhost:3000/api/items');
url.searchParams.append('filters', JSON.stringify({
  name: { 
    column: 'name', 
    comparator: 'IN', 
    value: ['5.56 Rifle Ammo', 'Assault Rifle', 'Bolt Action Rifle', 'Explosive 5.56 Rifle Ammo', 'HV 5.56 Rifle Ammo']
  }
}));
url.searchParams.append('columns', JSON.stringify(['image_url']));

fetch(url)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## Python (requests):
```py
import requests
import json

url = 'http://localhost:3000/api/items'
params = {
    'filters': json.dumps({
        'name': {
            'column': 'name', 
            'comparator': 'IN', 
            'value': ['5.56 Rifle Ammo', 'Assault Rifle', 'Bolt Action Rifle', 'Explosive 5.56 Rifle Ammo', 'HV 5.56 Rifle Ammo']
        }
    }),
    'columns': json.dumps(['image_url'])
}

response = requests.get(url, params=params)
print(response.json())
```

## Result:
```json
[
    {
        "image_url": "https://wiki.rustclash.com/img/items40/ammo.rifle.png"
    },
    {
        "image_url": "https://wiki.rustclash.com/img/items40/rifle.ak.png"
    },
    {
        "image_url": "https://wiki.rustclash.com/img/items40/rifle.bolt.png"
    },
    {
        "image_url": "https://wiki.rustclash.com/img/items40/ammo.rifle.explosive.png"
    },
    {
        "image_url": "https://wiki.rustclash.com/img/items40/ammo.rifle.hv.png"
    }
]
```
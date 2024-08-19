const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const serverless = require('serverless-http');

//express code
////add special handling to quantity bc it can sometimes be json

//add input sanitizer
//add consumable table 
const app = express();
const port = 3000;
const LIMIT_CAP = 100;

// Middleware
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
};

const allowedColumns = {
    Craft: ['item_id', 'result_item', 'result_amount', 'ingredients', 'ingredients_recursive'],
    Durability: ['item_id', 'durability_type', 'category', 'tool', 'quantity', 'time', 'fuel', 'sulfur'],
    Items: ['id', 'name', 'image_url', 'identifier', 'stack_size', 'despawn_time', 'is_projectile_weapon', 'is_melee_weapon', 'is_deployable', 'is_consumable'],
    Loot: ['item_id', 'container', 'condition', 'amount', 'chance'],
    Recycle: ['item_id', 'recycler_name', 'yield', 'efficiency'],
    Shopping: ['item_id', 'shop_name', 'for_sale_item', 'for_sale_amount', 'cost_item', 'cost_amount'],
    Deployable: ['item_id', 'upkeep', 'hp', 'decay']
};

const columnTypes = {
    int: ['item_id', 'result_amount', 'id', 'quantity', 'time', 'fuel', 'sulfur', 'identifier', 'stack_size', 'despawn_time', 'efficiency', 'for_sale_amount', 'cost_amount', 'chance', 'hp', 'decay'],
    bool: ['is_projectile_weapon', 'is_consumable', 'is_deployable', 'is_melee_weapon'],
    str: ['result_item', 'durability_type', 'category', 'tool', 'name', 'image_url', 'container', 'recycler_name', 'shop_name', 'for_sale_item', 'cost_item'],
    other: ['condition', 'amount', 'upkeep'],
    json: ['yield', 'ingredients', 'ingredients_recursive']
};

const allowedComparators = {
    GT: ['int', 'other'],
    LT: ['int', 'other'],
    IN: ['str', 'int'],
    EQUALS: ['int', 'str', 'bool', 'other'],
    CONTAINS: ['int', 'str', 'other', 'json']
};

const checkIfValid = (comparator, column) =>
{
    let valid = false
    for (let type of allowedComparators[comparator])
    {
        if (columnTypes[type].includes(column))
        {
            valid = true
        }
    }
    return valid;
}

const getItemsDataByIds = async (connection, itemIds, columns) =>
{
    const query = `SELECT ${columns.map(col => `\`${col}\``).join(', ')} FROM Items WHERE id IN (${itemIds.map(() => '?').join(', ')})`;
    const [results] = await connection.execute(query, itemIds);
    console.log(query, itemIds)
    return results;
};

const getItemIdsByFilter = async (connection, column, comparator, value) =>
{
    let query = "SELECT id FROM Items WHERE ";
    let queryValues = [];

    switch (comparator)
    {
        case 'EQUALS':
            query += `${column} = ?`;
            queryValues.push(value);
            break;
        case 'CONTAINS':
            query += `${column} LIKE ?`;
            queryValues.push(`%${value}%`);
            break;
        case 'IN':
            query += `${column} IN (${value.map(() => '?').join(', ')})`;
            queryValues.push(...value);
            break;
        case 'GT':
            query += `${column} > ?`;
            queryValues.push(value);
            break;
        case 'LT':
            query += `${column} < ?`;
            queryValues.push(value);
            break;
        default:
            throw new Error(`Unsupported comparator for Items table column: ${comparator}`);
    }

    const [results] = await connection.execute(query, queryValues);
    if (results.length > 0)
    {
        return results.map(result => result.id);
    }
    throw new Error(`No items found for filter: ${column} ${comparator} ${value}`);
};

const columnCastingFunctions = {
    Loot: {
        amount: (column, comparator) =>
        {
            let sql = ''
            switch (comparator)
            {
                case 'GT':
                    sql = `CASE
                                WHEN INSTR(\`${column}\`, '-') > 0 THEN CAST(SUBSTRING_INDEX(\`${column}\`, '-', -1) AS UNSIGNED)
                                ELSE CAST(\`${column}\` AS UNSIGNED)
                            END`;
                    return { sql: sql, values: sql.split('?').length - 1, skipComparator: true }
                case 'LT':
                    sql = `CASE
                                WHEN INSTR(\`${column}\`, '-') > 0 THEN CAST(SUBSTRING_INDEX(\`${column}\`, '-', 1) AS UNSIGNED)
                                ELSE CAST(\`${column}\` AS UNSIGNED)
                            END`;
                    return { sql: sql, values: sql.split('?').length - 1, skipComparator: true }
                case 'EQUALS':
                    sql = `(
                                (INSTR(\`${column}\`, '-') > 0 AND ? BETWEEN CAST(SUBSTRING_INDEX(\`${column}\`, '-', 1) AS UNSIGNED) AND CAST(SUBSTRING_INDEX(\`${column}\`, '-', -1) AS UNSIGNED))
                                OR 
                                (INSTR(\`${column}\`, '-') = 0 AND \`${column}\` = ?)
                            )`;
                    return { sql: sql, values: sql.split('?').length - 1, skipComparator: true }
                case 'CONTAINS':
                    sql = `(
                                (INSTR(\`${column}\`, '-') > 0 AND ? BETWEEN CAST(SUBSTRING_INDEX(\`${column}\`, '-', 1) AS UNSIGNED) AND CAST(SUBSTRING_INDEX(\`${column}\`, '-', -1) AS UNSIGNED))
                                OR 
                                (INSTR(\`${column}\`, '-') = 0 AND (
                                    (\`${column}\` = ? AND RIGHT(\`${column}\`, 1) != '%') OR 
                                    (CAST(SUBSTRING(\`${column}\`, 1, LENGTH(\`${column}\`) - 1) AS UNSIGNED) = ? AND RIGHT(\`${column}\`, 1) = '%')
                                ))
                            )`;
                    return { sql: sql, values: sql.split('?').length - 1, skipComparator: true }
            }
        },
        condition: (column, comparator) =>
        {
            switch (comparator)
            {
                case 'GT':
                    sql = `CASE
                        WHEN INSTR(\`${column}\`, '-') > 0 THEN CAST(SUBSTRING_INDEX(\`${column}\`, '-', -1) AS UNSIGNED)
                        ELSE CAST(\`${column}\` AS UNSIGNED)
                    END`;
                    return { sql: sql, values: sql.split('?').length - 1, skipComparator: true }
                case 'LT':
                    sql = `CASE
                        WHEN INSTR(\`${column}\`, '-') > 0 THEN CAST(SUBSTRING_INDEX(\`${column}\`, '-', 1) AS UNSIGNED)
                        ELSE CAST(\`${column}\` AS UNSIGNED)
                    END`;
                    return { sql: sql, values: sql.split('?').length - 1, skipComparator: true }
                case 'EQUALS':
                    sql = `(
                        (INSTR(\`${column}\`, '-') > 0 AND ? BETWEEN CAST(SUBSTRING_INDEX(\`${column}\`, '-', 1) AS UNSIGNED) AND CAST(SUBSTRING_INDEX(\`${column}\`, '-', -1) AS UNSIGNED))
                        OR 
                        (INSTR(\`${column}\`, '-') = 0 AND \`${column}\` = ?)
                    )`;
                    return { sql: sql, values: sql.split('?').length - 1, skipComparator: true }
                case 'CONTAINS':
                    sql = `(
                        (INSTR(\`${column}\`, '-') > 0 AND ? BETWEEN CAST(SUBSTRING_INDEX(\`${column}\`, '-', 1) AS UNSIGNED) AND CAST(SUBSTRING_INDEX(\`${column}\`, '-', -1) AS UNSIGNED))
                        OR 
                        (INSTR(\`${column}\`, '-') = 0 AND \`${column}\` = ?)
                    )`;
                    return { sql: sql, values: sql.split('?').length - 1, skipComparator: true }
                default:
                    sql = `CAST(\`${column}\` AS UNSIGNED)`;
                    return { sql: sql, values: sql.split('?').length - 1, skipComparator: false }
            }
        },
        chance: (column, comparator) =>
        {
            sql = `CAST(\`${column}\` AS DECIMAL(10, 3))`;
            return { sql: sql, values: 1, skipComparator: false }
        }
    },
};

// Function to apply SQL casting to columns
const applyColumnCasting = (table, column, comparator) =>
{
    if (columnCastingFunctions[table] && columnCastingFunctions[table][column])
    {
        let { sql, values, skipComparator } = columnCastingFunctions[table][column](column, comparator)
        return { conditionColumn: sql, valueAmt: values, skipComparator: skipComparator };
    }
    return { conditionColumn: column, valueAmt: 1, skipComparator: false };
};

const processFilters = async (connection, table, filters, columns = [], logicalOp = 'AND', limit = 20, offset = 0, orderBy = []) =>
{
    const parsedFilters = JSON.parse(filters || '{}');
    const validLogicalOps = ['AND', 'OR', 'XOR', 'NAND', 'NOR'];

    if (!validLogicalOps.includes(logicalOp))
    {
        throw new Error(`Invalid logical operator: ${logicalOp}. Use one of ${validLogicalOps.join(', ')}.`);
    }

    const validColumns = allowedColumns[table].concat(allowedColumns['Items']);
    if (!validColumns)
    {
        throw new Error('Invalid table name');
    }

    // Check if columns in filters are valid
    if (!Object.values(parsedFilters).every(filter => validColumns.includes(filter.column)))
    {
        throw new Error('One or more invalid column names in filter');
    }

    // Check if requested columns are valid
    if (columns.some(col => !validColumns.includes(col)))
    {
        throw new Error('One or more invalid column names');
    }

    const conditions = [];
    const values = [];
    const itemsTableColumns = allowedColumns['Items'].filter(col => !allowedColumns[table].includes(col));
    const allColumnsFromItems = columns.every(col => itemsTableColumns.includes(col));

    if (allColumnsFromItems && table !== 'Items')
    {
        const itemIdQuery = await processFilters(connection, table, filters, ['item_id'], logicalOp, limit, offset, orderBy);

        // Execute the query to get item_ids
        const [itemIdResults] = await connection.execute(itemIdQuery.query, itemIdQuery.values);
        const itemIds = itemIdResults.map(result => result.item_id);

        const itemsData = await getItemsDataByIds(connection, itemIds, columns);

        return { results: itemsData, isDirectResult: true };
    }

    for (const [key, filter] of Object.entries(parsedFilters))
    {
        const { column, comparator, value } = filter;

        if (itemsTableColumns.includes(column) && table !== 'Items')
        {
            const itemIds = await getItemIdsByFilter(connection, column, comparator, value);
            conditions.push(`item_id IN (${itemIds.map(() => '?').join(', ')})`);
            values.push(...itemIds);
            continue;
        }

        let { conditionColumn, valueAmt, skipComparator } = applyColumnCasting(table, column, comparator);
        valueAmt = valueAmt || 1;
        const paramPlaceholder = '?';

        if (!checkIfValid(comparator, column))
        {
            throw new Error(`Invalid comparator '${comparator}' for column '${column}'`);
        }

        switch (comparator)
        {
            case 'IN':
                if (Array.isArray(value))
                {
                    conditions.push(`${conditionColumn} IN (${value.map(() => paramPlaceholder).join(', ')})`);
                    values.push(...value);
                } else
                {
                    throw new Error("Value for 'IN' comparator should be an array.");
                }
                break;
            case 'EQUALS':
                if (!skipComparator)
                {
                    conditions.push(`${conditionColumn} = ${paramPlaceholder}`);
                } else
                {
                    for (let i = 0; i < valueAmt - 1; ++i)
                    {
                        console.log('push', valueAmt)
                        values.push(value);
                    }

                    conditions.push(conditionColumn);
                }
                values.push(value);
                break;
            case 'CONTAINS':
                if (!skipComparator)
                {
                    conditions.push(`LOWER (${conditionColumn}) LIKE LOWER(${paramPlaceholder})`);
                    values.push(`%${value}%`);
                } else
                {
                    for (let i = 0; i < valueAmt; ++i)
                    {
                        values.push(`${value}`);
                    }

                    conditions.push(conditionColumn);
                }

                break;
            case 'GT':
                conditions.push(`${conditionColumn} > ${paramPlaceholder}`);
                values.push(value);
                break;
            case 'LT':
                conditions.push(`${conditionColumn} < ${paramPlaceholder}`);
                values.push(value);
                break;
            default:
                throw new Error(`Unsupported comparator: ${comparator}`);
        }
    };

    let conditionsString = '';

    let tempOp = ''
    if (logicalOp === 'NAND')
    {
        tempOp = 'AND'
    } else if (logicalOp === 'NOR')
    {
        tempOp = 'OR'
    }
    else
    {
        tempOp = logicalOp
    }

    if (conditions.length > 0)
    {
        conditionsString = conditions.join(` ${tempOp} `);
        if (logicalOp === 'NAND' || logicalOp === 'NOR')
        {
            conditionsString = `NOT (${conditionsString})`;
        }
    }

    let orderClause = '';
    if (orderBy.length > 0)
    {
        const orderParts = orderBy.map(order =>
        {
            const orderObj = Object.values(order)[0];
            const column = orderObj.column;
            if (!validColumns.includes(column))
            {
                throw new Error(`Invalid column name in order clause: ${column}`);
            }
            const direction = orderObj.descending ? 'DESC' : 'ASC';
            return `\`${column}\` ${direction}`;
        });
        orderClause = `ORDER BY ${orderParts.join(', ')}`;
    }
    console.log(orderClause)
    limit = Math.min(Math.max(1, limit), LIMIT_CAP);
    offset = Math.max(0, offset);

    const query = `SELECT ${columns.length === 0 ? '*' : columns.map(col => `\`${col}\``).join(', ')} FROM \`${table}\` ${conditionsString ? `WHERE ${conditionsString}` : ''} ${orderClause} LIMIT ${limit} OFFSET ${offset};`;
    return { query, values, isDirectResult: false };
};

// Generate routes for each table
for (const table in allowedColumns)
{
    app.get(`/api/${table.toLowerCase()}`, async (req, res) =>
    {
        const filters = req.query.filters || '{}';
        const columns = req.query.columns ? JSON.parse(req.query.columns) : [];
        const logicalOp = req.query.logicalOp || 'AND';
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const orderBy = req.query.orderBy ? JSON.parse(req.query.orderBy) : [];

        function buildQueryWithValues(query, values)
        {
            return query.replace(/\?/g, () => mysql.escape(values.shift()));
        }
        try
        {
            const connection = await mysql.createConnection(dbConfig);
            let result = await processFilters(connection, table, filters, columns, logicalOp, limit, offset, orderBy);
            console.log(result)
            let finalResults;
            if (result.isDirectResult)
            {
                finalResults = result.results;
            } else
            {
                const { query, values } = result;
                const queryWithValues = buildQueryWithValues(query, [...values]);
                console.log(query);
                console.log(values);
                const [queryResults] = await connection.execute(query, values);
                finalResults = queryResults;
            }

            await connection.end();
            res.json(finalResults);
        } catch (error)
        {
            res.status(400).json({ error: error.message });
        }
    });
}

module.exports.handler = serverless(app);
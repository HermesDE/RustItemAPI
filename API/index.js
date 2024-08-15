const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

//test durability table

//express code
////add special handling to quantity bc it can sometimes be json
//add range handling for upkeep

//upload code
////change efficiency and chance to double
////convert despawn_time to int


//scraper code
////fix result_amount *
////check ingredients_recursive *
////convert despawn_time to int *

//add consumable table
//fix aim_cone and weapon_table_data
//must include 0 before . in double
const app = express();
const port = 3000;

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


// Define column-specific casting functions
const columnCastingFunctions = {
    Loot: {
        amount: (column, comparator) =>
        {
            // Handle behavior based on comparator
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
            // Handle behavior based on comparator
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
    // Add more casting rules for other tables/columns as needed
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

const processFilters = (table, filters, columns = [], logicalOp = 'AND') =>
{
    const parsedFilters = JSON.parse(filters || '{}');
    const validLogicalOps = ['AND', 'OR', 'XOR', 'NAND', 'NOR'];

    if (!validLogicalOps.includes(logicalOp))
    {
        throw new Error(`Invalid logical operator: ${logicalOp}. Use one of ${validLogicalOps.join(', ')}.`);
    }

    const validColumns = allowedColumns[table];
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
    Object.entries(parsedFilters).forEach(([key, filter]) =>
    {
        const { column, comparator, value } = filter;
        let { conditionColumn, valueAmt, skipComparator } = applyColumnCasting(table, column, comparator);
        console.log(valueAmt)
        valueAmt = valueAmt || 1
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
    });

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
            console.log(1111)
            conditionsString = `NOT (${conditionsString})`;
        }
    }
    const query = `SELECT ${columns.length === 0 ? '*' : columns.map(col => `\`${col}\``).join(', ')} FROM \`${table}\` ${conditionsString ? `WHERE ${conditionsString}` : ''} LIMIT 2;`;
    return { query, values };
};

// Generate routes for each table
for (const table in allowedColumns)
{
    app.get(`/api/${table.toLowerCase()}`, async (req, res) =>
    {
        const filters = req.query.filters || '{}';
        const columns = req.query.columns ? JSON.parse(req.query.columns) : [];
        const logicalOp = req.query.logicalOp || 'AND';

        function buildQueryWithValues(query, values)
        {
            return query.replace(/\?/g, () => mysql.escape(values.shift()));
        }
        try
        {
            const connection = await mysql.createConnection(dbConfig);
            const { query, values } = processFilters(table, filters, columns, logicalOp);
            const queryWithValues = buildQueryWithValues(query, [...values]);
            console.log(queryWithValues)
            console.log(values)
            // Execute query with values using parameterized query to prevent SQL injection
            const [results] = await connection.execute(query, values);

            await connection.end();
            res.json(results);
        } catch (error)
        {
            res.status(400).json({ error: error.message });
        }
    });
}

// Example server setup
app.listen(port, () =>
{
    console.log(`Server running at http://localhost:${port}`);
});

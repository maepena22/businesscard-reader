const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const dbPath = path.join(process.cwd(), 'businesscards.sqlite');

async function getDb() {
    return open({
        filename: dbPath,
        driver: sqlite3.Database
    });
}

async function initializeDb() {
    const db = await getDb();
    
    await db.exec(`
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS business_cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_path TEXT NOT NULL,
            organization TEXT,
            department TEXT,
            name TEXT,
            address TEXT,
            telephone TEXT,
            phone TEXT,      /* Add new phone field */
            fax TEXT,
            email TEXT,
            website TEXT,
            employee_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        );
    `);

    await db.close();
}

// Add new functions for employee management
async function addEmployee(name) {
    const db = await getDb();
    const result = await db.run('INSERT INTO employees (name) VALUES (?)', [name]);
    await db.close();
    return result;
}

async function getAllEmployees() {
    const db = await getDb();
    const employees = await db.all('SELECT * FROM employees ORDER BY name');
    await db.close();
    return employees;
}

// Remove the first simple deleteEmployee function (around line 59-64)
// and keep only the transactional version

async function deleteEmployee(id) {
    const db = await getDb();
    try {
        await db.run('BEGIN TRANSACTION');
        // Update business cards to remove reference to deleted employee
        await db.run('UPDATE business_cards SET employee_id = NULL WHERE employee_id = ?', [id]);
        // Delete the employee
        await db.run('DELETE FROM employees WHERE id = ?', [id]);
        await db.run('COMMIT');
        return { success: true };
    } catch (error) {
        await db.run('ROLLBACK');
        throw error;
    } finally {
        await db.close();
    }
}

// Update saveBusinessCard function
async function saveBusinessCard(data) {
    const db = await getDb();
    
    const result = await db.run(`
        INSERT INTO business_cards (
            image_path, organization, department, name, 
            address, telephone, phone, fax, email, website, employee_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        data.Image,
        data.organization,
        data.department,
        data.name,
        data.address,
        data.telephone,
        data.phone,
        data.fax,
        data.email,
        data.website,
        data.employee_id
    ]);

    await db.close();
    return result;
}

async function getAllBusinessCards() {
    const db = await getDb();
    const cards = await db.all(`
        SELECT 
            business_cards.*,
            employees.name as employee_name
        FROM business_cards
        LEFT JOIN employees ON business_cards.employee_id = employees.id
        ORDER BY business_cards.created_at DESC
    `);
    await db.close();
    return cards;
}

// Update the export function
async function processUploadedImages(files, googleApiKey, openaiApiKey) {
    const data = [];
    const headers = {
        'Image': 'Image',
        'organization': 'Organization',
        'department': 'Department',
        'name': 'Name',
        'address': 'Address',
        'telephone': 'Telephone',
        'fax': 'Fax',
        'email': 'Email',
        'website': 'Website',
        'employee_name': 'Uploader'  // Add uploader column
    };
    
    for (const file of files) {
        console.log(`Processing ${file.originalname}...`);

        try {
            const extractedText = await uploadImageAndGetText(file.path, googleApiKey);
            if (!extractedText) {
                console.log(`No text detected in ${file.originalname}`);
                continue;
            }

            const structuredData = await structureBusinessCardDataUsingChatGPT(extractedText, openaiApiKey);

            try {
                const jsonData = JSON.parse(structuredData);
                const rowData = {};
                
                // Map each field explicitly
                rowData['Image'] = file.originalname;
                rowData['organization'] = jsonData.organization || '';
                rowData['department'] = jsonData.department || '';
                rowData['name'] = jsonData.name || '';
                rowData['address'] = jsonData.address || '';
                rowData['telephone'] = jsonData.telephone || '';
                rowData['fax'] = jsonData.fax || '';
                rowData['email'] = jsonData.email || '';
                rowData['website'] = jsonData.website || '';
                
                data.push(rowData);
            } catch (error) {
                console.error(`Invalid JSON format for ${file.originalname}: ${error.message}`);
            }
        } catch (error) {
            console.error(`Error processing ${file.originalname}: ${error.message}`);
        }
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Business Cards');

    if (data.length > 0) {
        // Add headers with proper formatting
        const headerRow = worksheet.addRow(Object.values(headers));
        headerRow.font = { bold: true };
        
        // Add data rows with explicit mapping
        data.forEach(row => {
            const rowValues = Object.keys(headers).map(key => row[key] || '');
            worksheet.addRow(rowValues);
        });

        // Auto-fit columns
        worksheet.columns.forEach(column => {
            column.width = Math.max(
                Math.max(...worksheet.getColumn(column.number).values.map(v => v ? v.toString().length : 0)),
                headers[Object.keys(headers)[column.number - 1]].length
            ) + 2;
        });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
}

module.exports = {
    initializeDb,
    saveBusinessCard,
    getAllBusinessCards,
    getDb,  // Add getDb to exports
    addEmployee,
    getAllEmployees,
    deleteEmployee
};
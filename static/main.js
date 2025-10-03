// SQL Beautifier Functions
// sqlEditor will hold a CodeMirror instance when available
let sqlEditor; // global
// File upload and preview for Data Extract JSON
// Drag & drop for JSON
const jsonDropZone = document.getElementById('extractJsonDropZone');
if (jsonDropZone) {
    jsonDropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        jsonDropZone.classList.add('border-blue-400', 'bg-blue-50');
    });
    jsonDropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        jsonDropZone.classList.remove('border-blue-400', 'bg-blue-50');
    });
    jsonDropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        jsonDropZone.classList.remove('border-blue-400', 'bg-blue-50');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                document.getElementById('extractJsonInput').value = ev.target.result;
                updateExtractJsonPreview();
            };
            reader.readAsText(file);
        }
    });
}
function handleExtractJsonFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('extractJsonInput').value = e.target.result;
        updateExtractJsonPreview();
    };
    reader.readAsText(file);
}

function updateExtractJsonPreview() {
    const val = document.getElementById('extractJsonInput').value;
    let preview = '';
    try {
        const obj = JSON.parse(val);
        preview = JSON.stringify(obj, null, 2);
    } catch (e) {
        preview = 'Invalid JSON';
    }
    document.getElementById('extractJsonPreview').textContent = preview;
}
document.getElementById('extractJsonInput').addEventListener('input', updateExtractJsonPreview);

// File upload and preview for Data Extract XML
// Drag & drop for XML
const xmlDropZone = document.getElementById('extractXmlDropZone');
if (xmlDropZone) {
    xmlDropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        xmlDropZone.classList.add('border-blue-400', 'bg-blue-50');
    });
    xmlDropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        xmlDropZone.classList.remove('border-blue-400', 'bg-blue-50');
    });
    xmlDropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        xmlDropZone.classList.remove('border-blue-400', 'bg-blue-50');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.xml')) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                document.getElementById('extractXmlInput').value = ev.target.result;
                updateExtractXmlPreview();
            };
            reader.readAsText(file);
        }
    });
}
function handleExtractXmlFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('extractXmlInput').value = e.target.result;
        updateExtractXmlPreview();
    };
    reader.readAsText(file);
}

function updateExtractXmlPreview() {
    const val = document.getElementById('extractXmlInput').value;
    let preview = '';
    try {
        // Format XML with indentation
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(val, 'application/xml');
        const serializer = new XMLSerializer();
        let xmlStr = serializer.serializeToString(xmlDoc);
        // Pretty print (basic)
        preview = xmlStr.replace(/(>)(<)(\/*)/g, '$1\n$2$3');
    } catch (e) {
        preview = 'Invalid XML';
    }
    document.getElementById('extractXmlPreview').textContent = preview;
}
document.getElementById('extractXmlInput').addEventListener('input', updateExtractXmlPreview);
// Show/hide sections including Data Extract
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => sec.style.display = 'none');
    const target = document.getElementById(sectionId);
    if (target) target.style.display = '';
}

// Data Extract: JSON
let lastJsonExtractRows = [];
let lastJsonExtractFields = [];
function extractJsonPreview() {
    let jsonText = document.getElementById('extractJsonInput').value;
    let parentCond = document.getElementById('extractJsonParent').value.trim();
    let fields = document.getElementById('extractJsonFields').value.split(',').map(f => f.trim()).filter(f => f);
    let resultDiv = document.getElementById('extractJsonResult');
    let outputTa = document.getElementById('extractJsonOutput');
    resultDiv.innerHTML = '';
    if (outputTa) outputTa.value = '';
    // If input is empty, show an error instead of a successful preview
    if (!jsonText || !jsonText.trim()) {
        lastJsonExtractRows = [];
        lastJsonExtractFields = [];
        resultDiv.innerHTML = '<span class="text-red-600">Error: Please enter JSON to extract.</span>';
        return;
    }
    try {
        let data = JSON.parse(jsonText);
        if (!Array.isArray(data)) data = [data];
        if (!data.length) {
            throw new Error('No JSON items found');
        }
        if (parentCond) {
            let [pField, pValue] = parentCond.split('=');
            if (pField && pValue) {
                pField = pField.trim();
                pValue = pValue.trim();
                data = data.filter(item => String(item[pField]) === pValue);
            }
        }
        let rows = data.map(item => {
            let row = {};
            fields.forEach(f => {
                if (f.includes('.')) {
                    let [parent, child] = f.split('.');
                    if (Array.isArray(item[parent])) {
                        row[f] = item[parent].map(sub => sub[child]).join('\n');
                    } else if (item[parent]) {
                        row[f] = item[parent][child];
                    } else {
                        row[f] = '';
                    }
                } else {
                    row[f] = item[f];
                }
            });
            return row;
        });
        lastJsonExtractRows = rows;
        lastJsonExtractFields = fields;
        // Output to textarea
        let csv = fields.join(',') + '\n';
        rows.forEach(row => {
            csv += fields.map(f => '"' + (row[f] !== undefined ? String(row[f]).replace(/"/g, '""') : '') + '"').join(',') + '\n';
        });
        if (outputTa) outputTa.value = csv;
        resultDiv.innerHTML = '<span class="text-green-600">Preview generated!</span>';
    } catch (e) {
        resultDiv.innerHTML = '<span class="text-red-600">Error: ' + e.message + '</span>';
    }
}

function downloadJsonCSV() {
    if (!lastJsonExtractRows.length || !lastJsonExtractFields.length) {
        document.getElementById('extractJsonResult').innerHTML = '<span class="text-red-600">No data to download. Please extract first.</span>';
        return;
    }
    let csv = lastJsonExtractFields.join(',') + '\n';
    lastJsonExtractRows.forEach(row => {
        csv += lastJsonExtractFields.map(f => '"' + (row[f] !== undefined ? String(row[f]).replace(/"/g, '""') : '') + '"').join(',') + '\n';
    });
    let blob = new Blob([csv], {type: 'text/csv'});
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = getDownloadFilename('csv');
    a.click();
    URL.revokeObjectURL(url);
    document.getElementById('extractJsonResult').innerHTML = '<span class="text-green-600">CSV downloaded!</span>';
}

// Helper to generate timestamped download filename: result_mmddyy_hhmmss.ext
function getDownloadFilename(ext) {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `result_${mm}${dd}${yy}_${hh}${min}${ss}.${ext}`;
}

// Data Extract: XML (basic, requires XML to JS conversion)
let lastXmlExtractRows = [];
let lastXmlExtractFields = [];
function extractXmlPreview() {
    let xmlText = document.getElementById('extractXmlInput').value;
    let parentCond = document.getElementById('extractXmlParent').value.trim();
    let fields = document.getElementById('extractXmlFields').value.split(',').map(f => f.trim()).filter(f => f);
    let resultDiv = document.getElementById('extractXmlResult');
    let outputTa = document.getElementById('extractXmlOutput');
    resultDiv.innerHTML = '';
    if (outputTa) outputTa.value = '';
    // If input is empty, show an error instead of a successful preview
    if (!xmlText || !xmlText.trim()) {
        lastXmlExtractRows = [];
        lastXmlExtractFields = [];
        resultDiv.innerHTML = '<span class="text-red-600">Error: Please enter XML to extract.</span>';
        return;
    }
    try {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        // Detect parse errors: some browsers put a <parsererror> element
        if (xmlDoc.getElementsByTagName('parsererror').length) {
            throw new Error('Invalid XML format');
        }
        if (!xmlDoc.documentElement) {
            throw new Error('Invalid XML format');
        }
        let items = Array.from(xmlDoc.documentElement.children);
        if (!items.length) {
            throw new Error('No XML items found under the root element');
        }
        let data = items.map(item => {
            let obj = {};
            Array.from(item.children).forEach(child => {
                if (child.children.length > 0) {
                    obj[child.tagName] = Array.from(child.children).map(sub => {
                        let subObj = {};
                        Array.from(sub.children).forEach(subChild => {
                            subObj[subChild.tagName] = subChild.textContent;
                        });
                        return subObj;
                    });
                } else {
                    obj[child.tagName] = child.textContent;
                }
            });
            return obj;
        });
        if (parentCond) {
            let [pField, pValue] = parentCond.split('=');
            if (pField && pValue) {
                pField = pField.trim();
                pValue = pValue.trim();
                data = data.filter(item => String(item[pField]) === pValue);
            }
        }
        let rows = data.map(item => {
            let row = {};
            fields.forEach(f => {
                if (f.includes('.')) {
                    let [parent, child] = f.split('.');
                    if (Array.isArray(item[parent])) {
                        row[f] = item[parent].map(sub => sub[child]).join('\n');
                    } else if (item[parent]) {
                        row[f] = item[parent][child];
                    } else {
                        row[f] = '';
                    }
                } else {
                    row[f] = item[f];
                }
            });
            return row;
        });
        lastXmlExtractRows = rows;
        lastXmlExtractFields = fields;
        // Output to textarea
        let csv = fields.join(',') + '\n';
        rows.forEach(row => {
            csv += fields.map(f => '"' + (row[f] !== undefined ? String(row[f]).replace(/"/g, '""') : '') + '"').join(',') + '\n';
        });
        if (outputTa) outputTa.value = csv;
        resultDiv.innerHTML = '<span class="text-green-600">Preview generated!</span>';
    } catch (e) {
        resultDiv.innerHTML = '<span class="text-red-600">Error: ' + e.message + '</span>';
    }
}

function downloadXmlCSV() {
    if (!lastXmlExtractRows.length || !lastXmlExtractFields.length) {
        document.getElementById('extractXmlResult').innerHTML = '<span class="text-red-600">No data to download. Please extract first.</span>';
        return;
    }
    let csv = lastXmlExtractFields.join(',') + '\n';
    lastXmlExtractRows.forEach(row => {
        csv += lastXmlExtractFields.map(f => '"' + (row[f] !== undefined ? String(row[f]).replace(/"/g, '""') : '') + '"').join(',') + '\n';
    });
    let blob = new Blob([csv], {type: 'text/csv'});
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = getDownloadFilename('csv');
    a.click();
    URL.revokeObjectURL(url);
    document.getElementById('extractXmlResult').innerHTML = '<span class="text-green-600">CSV downloaded!</span>';
}

function initSQLEditor() {
    try {
        const ta = document.getElementById('sqlOutput');
        ta.value = '';
        if (typeof CodeMirror !== 'undefined' && ta) {
            if (sqlEditor) {
                sqlEditor.setValue('');
                sqlEditor.setOption('placeholder', 'Formatted SQL will appear here 123...');
            } else {
                sqlEditor = CodeMirror.fromTextArea(ta, {
                    mode: 'text/x-sql',
                    theme: 'eclipse',
                    lineNumbers: false,
                    readOnly: true,
                    matchBrackets: true,
                    viewportMargin: Infinity,
                    lineWrapping: true,
                });
                sqlEditor.setSize('100%', '20rem');

                // Apply same Tailwind classes as Input SQL textarea
                sqlEditor.getWrapperElement().classList.add(
                    "w-full", "h-80", "px-2", "py-1", "bg-gray-50", "border", "border-gray-300", "rounded-lg", "font-mono", "text-sm"
                     );

                // Hide original textarea
                ta.classList.add("hidden");

            }
        }
    } catch (e) {
        console.warn('CodeMirror init failed', e);
    }
}

function beautifySQL() {
    const input = document.getElementById('sqlInput').value;

    // Reset color before new run
    if (sqlEditor) sqlEditor.getWrapperElement().style.color = "black";

    let msg = '';
    if (!input.trim()) {
        msg = 'Error: Please enter SQL to beautify';
        if (sqlEditor) {
            sqlEditor.setValue(msg);
            setTimeout(() => highlightSQLErrorLines(), 10);
        }
        return;
    }

    // Basic SQL validation
    const validationErrors = validateSQL(input);
    if (validationErrors.length > 0) {
        msg = 'SQL Validation Errors:\n' + validationErrors.join('\n');
        if (sqlEditor) {
            sqlEditor.setValue(msg);
            setTimeout(() => highlightSQLErrorLines(), 10);
        }
        return;
    }

    try {
        const formatted = formatSQL(input);
        if (sqlEditor) {
            sqlEditor.setValue(formatted);
            setTimeout(() => highlightSQLErrorLines(), 10);
        }
    } catch (error) {
        msg = 'Error: ' + error.message;
        if (sqlEditor) {
            sqlEditor.setValue(msg);
            setTimeout(() => highlightSQLErrorLines(), 10);
        }
    }
}

// Highlight lines containing 'Error' in CodeMirror output
function highlightSQLErrorLines() {
    if (!sqlEditor) return;
    const cm = sqlEditor;
    const doc = cm.getDoc();
    const lineCount = doc.lineCount();
    let errorFound = false;
    for (let i = 0; i < lineCount; i++) {
        const text = doc.getLine(i);
        cm.removeLineClass(i, 'text', 'cm-error-line');
        if (!errorFound && /Error[:]?/i.test(text)) {
            errorFound = true;
        }
        if (errorFound) {
            cm.addLineClass(i, 'text', 'cm-error-line');
        }
    }
}


// Lightweight SQL syntax highlighter - not a full parser but good for readability
function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightSQL(sql) {
    // token patterns
    const patterns = [
        {type: 'comment', regex: /(\/\*[\s\S]*?\*\/|--.*?$)/gm},
        {type: 'string', regex: /'(?:''|[^'])*'/g},
        {type: 'number', regex: /\b\d+(?:\.\d+)?\b/g},
    {type: 'function', regex: /\b(AVG|COUNT|FIRST|LAST|MAX|MIN|SUM|UCASE|LCASE|MID|LEN|LENGTH|ROUND|NOW|GETDATE|CURDATE|CURRENT_DATE|CURRENT_TIME|CURRENT_TIMESTAMP|DATE|DATEADD|DATEDIFF|DATE_SUB|YEAR|MONTH|DAY|HOUR|MINUTE|SECOND|ABS|CEIL|CEILING|FLOOR|POWER|SQRT|MOD|RAND|TRUNCATE|COALESCE|NULLIF|ISNULL|IFNULL|NVL|CAST|CONVERT|FORMAT|CONCAT|CONCAT_WS|SUBSTRING|LEFT|RIGHT|REPLACE|INSTR|LOCATE|POSITION|CHAR_LENGTH|CHARACTER_LENGTH|REVERSE|ASCII|CHAR|LTRIM|RTRIM|TRIM|LOWER|UPPER|ROW_NUMBER)\b/gi},
    {type: 'keyword', regex: /\b(SELECT|FROM|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT|TOP|INSERT\s+INTO|VALUES|UPDATE|SET|DELETE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|CREATE\s+DATABASE|DROP\s+DATABASE|TRUNCATE|JOIN|INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|FULL\s+JOIN|ON|UNION|UNION\s+ALL|INTERSECT|EXCEPT|MINUS|PRIMARY\s+KEY|FOREIGN\s+KEY|NOT\s+NULL|IS\s+NULL|IS\s+NOT\s+NULL|UNIQUE|CHECK|DEFAULT|CONSTRAINT|INDEX|AUTO_INCREMENT|BEGIN|START\s+TRANSACTION|COMMIT|ROLLBACK|DISTINCT|IN|BETWEEN|LIKE|AS|CASE|WHEN|THEN|ELSE|END|EXISTS|ALL|ANY|SOME|CAST|CONVERT|COALESCE|NULLIF|MAX|MIN|AVG|SUM|COUNT|NOW|CURDATE|GETDATE|SYSDATE|DATE|DATEADD|DATEDIFF|DATE_SUB|INTERVAL|DAY|MONTH|YEAR|TIME|CURRENT_TIMESTAMP|CURRENT_DATE|CURRENT_TIME|DATABASE|TABLE|VIEW|PROCEDURE|FUNCTION|TRIGGER|CURSOR|DECLARE|FETCH|OPEN|CLOSE|LOOP|WHILE|IF|ELSEIF|SIGNAL|RESIGNAL|RETURN|OVER|PARTITION|ID|RN)\b/gi},
        {type: 'operator', regex: /[+\-*\/=%<>!]+/g},
        {type: 'paren', regex: /[()]/g}
    ];

    // We'll perform a simple pass that escapes HTML then applies replacements from left to right.
    let html = escapeHtml(sql);

    // Apply comments and strings first to avoid inner replacements
    html = html.replace(/(\/\*[\s\S]*?\*\/|--.*?$)/gm, function(m) { return `<span class="sql-comment">${escapeHtml(m)}</span>`; });
    html = html.replace(/'(?:''|[^'])*'/g, function(m) { return `<span class="sql-string">${escapeHtml(m)}</span>`; });

    // Functions
    html = html.replace(/\b(AVG|COUNT|FIRST|LAST|MAX|MIN|SUM|UCASE|LCASE|MID|LEN|LENGTH|ROUND|NOW|GETDATE|CURDATE|CURRENT_DATE|CURRENT_TIME|CURRENT_TIMESTAMP|DATE|DATEADD|DATEDIFF|DATE_SUB|YEAR|MONTH|DAY|HOUR|MINUTE|SECOND|ABS|CEIL|CEILING|FLOOR|POWER|SQRT|MOD|RAND|TRUNCATE|COALESCE|NULLIF|ISNULL|IFNULL|NVL|CAST|CONVERT|FORMAT|CONCAT|CONCAT_WS|SUBSTRING|LEFT|RIGHT|REPLACE|INSTR|LOCATE|POSITION|CHAR_LENGTH|CHARACTER_LENGTH|REVERSE|ASCII|CHAR|LTRIM|RTRIM|TRIM|LOWER|UPPER)\b/gi, function(m) { return `<span class="sql-function">${m.toUpperCase()}</span>`; });

    // Keywords (case-insensitive)
    html = html.replace(/\b(SELECT|FROM|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT|TOP|INSERT\s+INTO|VALUES|UPDATE|SET|DELETE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|CREATE\s+DATABASE|DROP\s+DATABASE|TRUNCATE|JOIN|INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|FULL\s+JOIN|ON|UNION|UNION\s+ALL|INTERSECT|EXCEPT|MINUS|PRIMARY\s+KEY|FOREIGN\s+KEY|NOT\s+NULL|IS\s+NULL|IS\s+NOT\s+NULL|UNIQUE|CHECK|DEFAULT|CONSTRAINT|INDEX|AUTO_INCREMENT|BEGIN|START\s+TRANSACTION|COMMIT|ROLLBACK|DISTINCT|IN|BETWEEN|LIKE|AS|CASE|WHEN|THEN|ELSE|END|EXISTS|ALL|ANY|SOME|CAST|CONVERT|COALESCE|NULLIF|MAX|MIN|AVG|SUM|COUNT|NOW|CURDATE|GETDATE|SYSDATE|DATE|DATEADD|DATEDIFF|DATE_SUB|INTERVAL|DAY|MONTH|YEAR|TIME|CURRENT_TIMESTAMP|CURRENT_DATE|CURRENT_TIME|DATABASE|TABLE|VIEW|PROCEDURE|FUNCTION|TRIGGER|CURSOR|DECLARE|FETCH|OPEN|CLOSE|LOOP|WHILE|IF|ELSEIF|SIGNAL|RESIGNAL|RETURN)\b/gi, function(m) {
        return `<span class="sql-keyword">${m.toUpperCase()}</span>`;
    });

    // Numbers
    html = html.replace(/\b\d+(?:\.\d+)?\b/g, function(m) { return `<span class="sql-number">${m}</span>`; });

    // Operators
    html = html.replace(/[+\-*\/=%<>!]+/g, function(m) { return `<span class="sql-operator">${m}</span>`; });

    // Parentheses
    html = html.replace(/[()]/g, function(m) { return `<span class="sql-paren">${m}</span>`; });

    return html;
}

function validateSQL(sql) {
    const errors = [];
    // Remove comments (block and line) for validation purposes
    let sqlNoComments = sql.replace(/\/\*[\s\S]*?\*\//g, '');
    sqlNoComments = sqlNoComments.replace(/--.*?$/gm, '');
    const sqlTrim = sqlNoComments.trim();
    // If after removing comments there's nothing, treat as empty input
    if (!sqlTrim) {
        errors.push('SQL appears to contain only comments or is empty. Please provide an SQL statement.');
        return errors;
    }
    // Check for common SQL statement start
    if (!/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH|BEGIN|START|TRUNCATE)\b/i.test(sqlTrim)) {
        errors.push('SQL must start with a valid statement (e.g. SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, WITH, BEGIN).');
    }
    // Check for balanced parentheses
    // Count parentheses ignoring comments and strings
    const sqlNoStrings = sqlTrim.replace(/(['"]).*?\1/g, '');
    let paren = 0;
    for (let c of sqlNoStrings) {
        if (c === '(') paren++;
        if (c === ')') paren--;
        if (paren < 0) {
            errors.push('Unmatched closing parenthesis.');
            break;
        }
    }
    if (paren > 0) errors.push('Unmatched opening parenthesis.');
    // Check for at least one FROM in SELECT
    if (/^\s*SELECT/i.test(sqlTrim) && !/\bFROM\b/i.test(sqlTrim)) {
        errors.push('SELECT statement should contain a FROM clause.');
    }
    // Check for ending semicolon
    if (!/;\s*$/.test(sqlTrim)) {
        errors.push('SQL should end with a semicolon (;)');
    }
    // Check for forbidden keywords (very basic)
    if (/\b(DELETE|DROP|TRUNCATE)\b/i.test(sqlTrim) && !/\bWHERE\b/i.test(sqlTrim)) {
        errors.push('DELETE, DROP or TRUNCATE statements should have a WHERE clause (or be used carefully) to avoid affecting all rows.');
    }

    // Enhanced: Check for misspelled or unknown SQL keywords
    // Known keywords list (single-word tokens). Multi-word constructs like "GROUP BY" will be validated
    // by checking the individual tokens ('GROUP' and 'BY') to avoid grouping tokens across newlines.
    const knownKeywords = new Set([
        'SELECT','FROM','WHERE','GROUP','BY','ORDER','HAVING','LIMIT','OFFSET','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','ALTER','DROP','WITH','INNER','JOIN','LEFT','RIGHT','FULL','ON','AND','OR','UNION','EXCEPT','INTERSECT','MINUS','IN','EXISTS','NOT','CASE','WHEN','THEN','ELSE','END','AS','DISTINCT','TOP','IS','NULL','LIKE','BETWEEN','ASC','DESC','PRIMARY','KEY','FOREIGN','CONSTRAINT','UNIQUE','CHECK','DEFAULT','INDEX','AUTO_INCREMENT','BEGIN','START','TRANSACTION','COMMIT','ROLLBACK','TRUNCATE','DATABASE','TABLE','VIEW','PROCEDURE','FUNCTION','TRIGGER','CURSOR','DECLARE','FETCH','OPEN','CLOSE','LOOP','WHILE','IF','ELSEIF','SIGNAL','RESIGNAL','RETURN','CAST','CONVERT','COALESCE','NULLIF','ALL','ANY','SOME','MIN','MAX','AVG','SUM','COUNT','NOW','CURDATE','GETDATE','SYSDATE','DATE','DATEADD','DATEDIFF','DATE_SUB','INTERVAL','DAY','MONTH','YEAR','TIME','CURRENT_TIMESTAMP','CURRENT_DATE','CURRENT_TIME',
        // Additional analytic / identifier tokens
        'ID','ROW_NUMBER','OVER','PARTITION','RN'
    ]);

    // Match only single-word UPPER-like tokens (prevents matching multi-word sequences like "SELECT MAX")
    const keywordPattern = /\b([A-Z][A-Z0-9_]*)\b/g;
    let match;
    let unknowns = [];
    // Remove quoted strings to avoid false positives
    const sqlForKeywords = sqlNoComments.replace(/(['"]).*?\1/g, '');
    while ((match = keywordPattern.exec(sqlForKeywords)) !== null) {
        const word = match[1].toUpperCase();
        // Skip short tokens and obvious identifiers (length <= 1)
        if (word.length <= 1) continue;
        if (!knownKeywords.has(word) && !/^\d+$/.test(word)) {
            unknowns.push(word);
        }
    }
    // Remove duplicates
    unknowns = [...new Set(unknowns)];
    if (unknowns.length > 0) {
        errors.push('Unknown or misspelled SQL keyword(s): ' + unknowns.join(', '));
    }
    return errors;
}

function formatSQL(sql) {
    // Basic SQL formatter: splits keywords to new lines and indents
    // This is a simple implementation, not a full SQL parser
    const keywords = [
        'SELECT','FROM','WHERE','GROUP BY','ORDER BY','HAVING','LIMIT','OFFSET','TOP',
        'INSERT INTO','VALUES','UPDATE','SET','DELETE','DELETE FROM','CREATE TABLE','ALTER TABLE','DROP TABLE','CREATE DATABASE','DROP DATABASE','TRUNCATE',
        'INNER JOIN','LEFT JOIN','RIGHT JOIN','FULL JOIN','JOIN','ON','AND','OR','UNION','UNION ALL','INTERSECT','EXCEPT','MINUS',
        'IN','EXISTS','NOT','CASE','WHEN','THEN','ELSE','END','AS','DISTINCT','PRIMARY KEY','FOREIGN KEY','CONSTRAINT','UNIQUE','CHECK','DEFAULT',
        'BEGIN','START TRANSACTION','COMMIT','ROLLBACK',
        // analytic / identifier tokens
        'OVER','PARTITION','ROW_NUMBER','ID','RN'
    ];
    let formatted = sql;
    // Place keywords on new lines
    keywords.forEach(kw => {
        const regex = new RegExp('\\b' + kw.replace(/ /g, '\\s+') + '\\b', 'gi');
        formatted = formatted.replace(regex, '\n' + kw);
    });
    // Remove multiple newlines
    formatted = formatted.replace(/\n{2,}/g, '\n');
    // Indent lines after SELECT, WHERE, etc.
    const indentKeywords = ['SELECT', 'WHERE', 'FROM', 'GROUP BY', 'ORDER BY', 'HAVING', 'SET', 'VALUES'];
    let lines = formatted.split('\n');
    let indent = '';
    let result = '';
    lines.forEach(line => {
        let trimmed = line.trim();
        if (!trimmed) return;
        let upper = trimmed.toUpperCase();
        if (indentKeywords.some(kw => upper.startsWith(kw))) {
            indent = '';
        }
        result += indent + trimmed + '\n';
        if (upper.startsWith('SELECT') || upper.startsWith('WHERE') || upper.startsWith('SET') || upper.startsWith('VALUES')) {
            indent = '  ';
        }
    });
    return result.trim();
}

function clearSQL() {
    document.getElementById('sqlInput').value = '';
    document.getElementById('sqlOutput').value = '';
}


// AJAX file upload for large files (JSON example)
document.addEventListener('DOMContentLoaded', function() {
    // Data Filter JSON chunked upload with textarea display
    const jsonFilterFileInput = document.getElementById('jsonFilterFileInput');
    const jsonFilterUploadStatus = document.getElementById('jsonFilterUploadStatus');
    if (jsonFilterFileInput && jsonFilterUploadStatus) {
        jsonFilterFileInput.addEventListener('change', function() {
            const files = jsonFilterFileInput.files;
            if (!files.length) return;
            // Only allow .json
            const file = files[0];
            if (!file.name.toLowerCase().endsWith('.json')) {
                jsonFilterUploadStatus.classList.remove('hidden');
                jsonFilterUploadStatus.textContent = 'Only .json files are allowed.';
                jsonFilterUploadStatus.style.color = 'red';
                jsonFilterFileInput.value = '';
                return;
            }
            jsonFilterUploadStatus.classList.remove('hidden');
            jsonFilterUploadStatus.textContent = 'Uploading...';
            jsonFilterUploadStatus.style.color = '';
            let uploaded = 0;
            let successCount = 0;
            let errorCount = 0;
            const CHUNK_SIZE = 5 * 1024 * 1024;
            function uploadChunk(file, chunkIndex, totalChunks, start, end, onProgress, onComplete, onError) {
                const chunk = file.slice(start, end);
                const formData = new FormData();
                formData.append('file', chunk);
                formData.append('filename', file.name);
                formData.append('chunkIndex', chunkIndex);
                formData.append('totalChunks', totalChunks);
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/uploads', true);
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        onComplete();
                    } else {
                        onError();
                    }
                };
                xhr.onerror = function() { onError(); };
                xhr.upload.onprogress = function(e) {
                    if (e.lengthComputable) {
                        let percent = ((uploaded + e.loaded) / file.size) * 100;
                        jsonFilterUploadStatus.textContent = `Uploading: ${percent.toFixed(1)}%`;
                    }
                };
                xhr.send(formData);
            }
            function uploadFileInChunks(file, onFileComplete) {
                const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                let chunkIndex = 0;
                let uploadedSize = 0;
                function uploadNextChunk() {
                    if (chunkIndex < totalChunks) {
                        const start = chunkIndex * CHUNK_SIZE;
                        const end = Math.min(start + CHUNK_SIZE, file.size);
                        uploadChunk(
                            file,
                            chunkIndex,
                            totalChunks,
                            start,
                            end,
                            function(loaded) {
                                uploadedSize += loaded;
                            },
                            function() {
                                chunkIndex++;
                                uploadNextChunk();
                            },
                            function() {
                                errorCount++;
                                jsonFilterUploadStatus.textContent = `Error uploading chunk ${chunkIndex + 1} of ${file.name}`;
                            }
                        );
                    } else {
                        uploaded += file.size;
                        successCount++;
                        jsonFilterUploadStatus.textContent = `Upload complete: ${file.name}`;
                        // Fetch the uploaded file from the server and display in textarea
                        fetch(`/uploads/${encodeURIComponent(file.name)}`)
                            .then(response => response.text())
                            .then(text => {
                                document.getElementById('jsonFilterInput').value = text;
                            });
                        setTimeout(() => { jsonFilterUploadStatus.classList.add('hidden'); }, 1500);
                        onFileComplete();
                    }
                }
                uploadNextChunk();
            }
            uploadFileInChunks(files[0], function(){});
        });
    }


    // Data Filter XML chunked upload
    const xmlFilterFileInput = document.getElementById('xmlFilterFileInput');
    const xmlFilterUploadStatus = document.getElementById('xmlFilterUploadStatus');
    if (xmlFilterFileInput && xmlFilterUploadStatus) {
        xmlFilterFileInput.addEventListener('change', function() {
            const files = xmlFilterFileInput.files;
            if (!files.length) return;
            // Only allow .xml
            const file = files[0];
            if (!file.name.toLowerCase().endsWith('.xml')) {
                xmlFilterUploadStatus.classList.remove('hidden');
                xmlFilterUploadStatus.textContent = 'Only .xml files are allowed.';
                xmlFilterUploadStatus.style.color = 'red';
                xmlFilterFileInput.value = '';
                return;
            }
            xmlFilterUploadStatus.classList.remove('hidden');
            xmlFilterUploadStatus.textContent = 'Uploading...';
            xmlFilterUploadStatus.style.color = '';
            let uploaded = 0;
            let successCount = 0;
            let errorCount = 0;
            const CHUNK_SIZE = 5 * 1024 * 1024;
            function uploadChunk(file, chunkIndex, totalChunks, start, end, onProgress, onComplete, onError) {
                const chunk = file.slice(start, end);
                const formData = new FormData();
                formData.append('file', chunk);
                formData.append('filename', file.name);
                formData.append('chunkIndex', chunkIndex);
                formData.append('totalChunks', totalChunks);
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/uploads', true);
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        onComplete();
                    } else {
                        onError();
                    }
                };
                xhr.onerror = function() { onError(); };
                xhr.upload.onprogress = function(e) {
                    if (e.lengthComputable) {
                        let percent = ((uploaded + e.loaded) / file.size) * 100;
                        xmlFilterUploadStatus.textContent = `Uploading: ${percent.toFixed(1)}%`;
                    }
                };
                xhr.send(formData);
            }
            function uploadFileInChunks(file, onFileComplete) {
                const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                let chunkIndex = 0;
                let uploadedSize = 0;
                function uploadNextChunk() {
                    if (chunkIndex < totalChunks) {
                        const start = chunkIndex * CHUNK_SIZE;
                        const end = Math.min(start + CHUNK_SIZE, file.size);
                        uploadChunk(
                            file,
                            chunkIndex,
                            totalChunks,
                            start,
                            end,
                            function(loaded) {
                                uploadedSize += loaded;
                            },
                            function() {
                                chunkIndex++;
                                uploadNextChunk();
                            },
                            function() {
                                errorCount++;
                                xmlFilterUploadStatus.textContent = `Error uploading chunk ${chunkIndex + 1} of ${file.name}`;
                            }
                        );
                    } else {
                        uploaded += file.size;
                        successCount++;
                        xmlFilterUploadStatus.textContent = `Upload complete: ${file.name}`;
                        setTimeout(() => { xmlFilterUploadStatus.classList.add('hidden'); }, 1500);
                        onFileComplete();
                    }
                }
                uploadNextChunk();
            }
            uploadFileInChunks(files[0], function(){});
        });
    }
    // JSON multi-file upload
    const jsonFileInput = document.getElementById('jsonFileInput');
    const jsonUploadForm = document.getElementById('jsonUploadForm');
    const uploadStatus = document.getElementById('uploadStatus');
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadProgressBar = document.getElementById('uploadProgressBar');
    if (jsonFileInput && jsonUploadForm) {
        jsonFileInput.addEventListener('change', function() {
            const files = jsonFileInput.files;
            if (!files.length) return;
            // Only allow .json
            const file = files[0];
            if (!file.name.toLowerCase().endsWith('.json')) {
                uploadStatus.classList.remove('hidden');
                uploadStatus.textContent = 'Only .json files are allowed.';
                uploadStatus.style.color = 'red';
                jsonFileInput.value = '';
                return;
            }
            uploadStatus.classList.remove('hidden');
            uploadStatus.textContent = 'Uploading...';
            uploadStatus.style.color = '';
            uploadProgress.classList.remove('hidden');
            uploadProgressBar.style.width = '0%';
            let uploaded = 0;
            let successCount = 0;
            let errorCount = 0;
            const CHUNK_SIZE = 5 * 1024 * 1024;
            function uploadChunk(file, chunkIndex, totalChunks, start, end, onProgress, onComplete, onError) {
                const chunk = file.slice(start, end);
                const formData = new FormData();
                formData.append('file', chunk);
                formData.append('filename', file.name);
                formData.append('chunkIndex', chunkIndex);
                formData.append('totalChunks', totalChunks);
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/uploads', true);
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        onComplete();
                    } else {
                        onError();
                    }
                };
                xhr.onerror = function() { onError(); };
                xhr.upload.onprogress = function(e) {
                    if (e.lengthComputable) {
                        let percent = ((uploaded + e.loaded) / file.size) * 100;
                        uploadProgressBar.style.width = percent + '%';
                        uploadStatus.textContent = `Uploading: ${percent.toFixed(1)}%`;
                    }
                };
                xhr.send(formData);
            }
            function uploadFileInChunks(file, onFileComplete) {
                const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                let chunkIndex = 0;
                let uploadedSize = 0;
                function uploadNextChunk() {
                    if (chunkIndex < totalChunks) {
                        const start = chunkIndex * CHUNK_SIZE;
                        const end = Math.min(start + CHUNK_SIZE, file.size);
                        uploadChunk(
                            file,
                            chunkIndex,
                            totalChunks,
                            start,
                            end,
                            function(loaded) {
                                uploadedSize += loaded;
                            },
                            function() {
                                chunkIndex++;
                                uploadNextChunk();
                            },
                            function() {
                                errorCount++;
                                uploadStatus.textContent = `Error uploading chunk ${chunkIndex + 1} of ${file.name}`;
                            }
                        );
                    } else {
                        uploaded += file.size;
                        successCount++;
                        uploadProgressBar.style.width = '100%';
                        uploadStatus.textContent = `Upload complete: ${file.name}`;
                        // Fetch the uploaded file from the server and display in textarea
                        fetch(`/uploads/${encodeURIComponent(file.name)}`)
                            .then(response => response.text())
                            .then(text => {
                                document.getElementById('jsonCsvInput').value = text;
                            });
                        setTimeout(() => { uploadProgress.classList.add('hidden'); uploadStatus.classList.add('hidden'); }, 1500);
                        onFileComplete();
                    }
                }
                uploadNextChunk();
            }
            uploadFileInChunks(files[0], function(){});
        });
    }

    // XML chunked upload with progress and textarea display
    const xmlFileInput = document.getElementById('xmlFileInput');
    const xmlUploadStatus = document.getElementById('xmlUploadStatus');
    if (xmlFileInput && xmlUploadStatus) {
        xmlFileInput.addEventListener('change', function() {
            const files = xmlFileInput.files;
            if (!files.length) return;
            // Only allow .xml
            const file = files[0];
            if (!file.name.toLowerCase().endsWith('.xml')) {
                xmlUploadStatus.classList.remove('hidden');
                xmlUploadStatus.textContent = 'Only .xml files are allowed.';
                xmlUploadStatus.style.color = 'red';
                xmlFileInput.value = '';
                return;
            }
            xmlUploadStatus.classList.remove('hidden');
            xmlUploadStatus.textContent = 'Uploading...';
            xmlUploadStatus.style.color = '';
            let uploaded = 0;
            let successCount = 0;
            let errorCount = 0;
            const CHUNK_SIZE = 5 * 1024 * 1024;
            function uploadChunk(file, chunkIndex, totalChunks, start, end, onProgress, onComplete, onError) {
                const chunk = file.slice(start, end);
                const formData = new FormData();
                formData.append('file', chunk);
                formData.append('filename', file.name);
                formData.append('chunkIndex', chunkIndex);
                formData.append('totalChunks', totalChunks);
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/uploads', true);
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        onComplete();
                    } else {
                        onError();
                    }
                };
                xhr.onerror = function() { onError(); };
                xhr.upload.onprogress = function(e) {
                    if (e.lengthComputable) {
                        let percent = ((uploaded + e.loaded) / file.size) * 100;
                        xmlUploadStatus.textContent = `Uploading: ${percent.toFixed(1)}%`;
                    }
                };
                xhr.send(formData);
            }
            function uploadFileInChunks(file, onFileComplete) {
                const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                let chunkIndex = 0;
                let uploadedSize = 0;
                function uploadNextChunk() {
                    if (chunkIndex < totalChunks) {
                        const start = chunkIndex * CHUNK_SIZE;
                        const end = Math.min(start + CHUNK_SIZE, file.size);
                        uploadChunk(
                            file,
                            chunkIndex,
                            totalChunks,
                            start,
                            end,
                            function(loaded) {
                                uploadedSize += loaded;
                            },
                            function() {
                                chunkIndex++;
                                uploadNextChunk();
                            },
                            function() {
                                errorCount++;
                                xmlUploadStatus.textContent = `Error uploading chunk ${chunkIndex + 1} of ${file.name}`;
                            }
                        );
                    } else {
                        uploaded += file.size;
                        successCount++;
                        xmlUploadStatus.textContent = `Upload complete: ${file.name}`;
                        // Fetch the uploaded file from the server and display in textarea
                        fetch(`/uploads/${encodeURIComponent(file.name)}`)
                            .then(response => response.text())
                            .then(text => {
                                document.getElementById('xmlCsvInput').value = text;
                            });
                        setTimeout(() => { xmlUploadStatus.classList.add('hidden'); }, 1500);
                        onFileComplete();
                    }
                }
                uploadNextChunk();
            }
            uploadFileInChunks(files[0], function(){});
        });
    }
});

//All main features

        function showSection(sectionId) {
            // Hide all sections
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {
                section.classList.add('hidden');
            });
                
            // Show selected
            const active = document.getElementById(sectionId);
            if (active) active.classList.remove('hidden');

            // Clear only SQL output when switching
            if (typeof sqlEditor !== 'undefined' && sqlEditor) {
                sqlEditor.setValue(''); // clear previous content
                sqlEditor.setOption('placeholder', 'Formatted SQL will appear here...');
            }

            // Clear all file upload and output textareas and progress bars to free memory and prevent lag
            // List of textarea IDs for file upload and output sections
            const clearTextareas = [
                // Inputs
                'jsonInput', 'xmlInput', 'jsonCsvInput', 'xmlCsvInput',
                'jsonFilterInput', 'xmlFilterInput', 'htmlInput', 'sqlInput',
                // Outputs (CONVERTER and DATA FILTERS)
                'jsonOutput', 'xmlOutput', 'csvOutput', 'xmlCsvOutput',
                // Data Extract output areas
                'extractJsonOutput', 'extractXmlOutput',
                'jsonFilterOutput', 'xmlFilterOutput', 'htmlOutput',
                // Data Extract JSON/XML
                'extractJsonInput','extractXmlInput',
                'extractJsonFields','extractXmlFields'
            ];
            clearTextareas.forEach(id => {
                const ta = document.getElementById(id);
                if (ta) ta.value = '';
            });

            // Clear Data Extract preview and output areas
            const clearDivs = [
                'extractJsonPreview','extractJsonResult','extractJsonTablePreview',
                'extractXmlPreview','extractXmlResult','extractXmlTablePreview'
            ];
            clearDivs.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = '';
            });

            // Reset last extracted data
            if (typeof lastJsonExtractRows !== 'undefined') lastJsonExtractRows = [];
            if (typeof lastJsonExtractFields !== 'undefined') lastJsonExtractFields = [];
            if (typeof lastXmlExtractRows !== 'undefined') lastXmlExtractRows = [];
            if (typeof lastXmlExtractFields !== 'undefined') lastXmlExtractFields = [];

            // Clear all file inputs
            const fileInputs = document.querySelectorAll('input[type="file"]');
            fileInputs.forEach(input => { input.value = ''; });
            // Hide all progress bars
            const progressBars = document.querySelectorAll('.progress-bar');
            progressBars.forEach(bar => {
                bar.style.width = '0%';
                bar.textContent = '';
            });
            // Clear all upload status messages
            const statusEls = document.querySelectorAll('.upload-status');
            statusEls.forEach(el => { el.textContent = ''; });

            // Show selected section
            const sectionEl = document.getElementById(sectionId);
            if (sectionEl) {
                sectionEl.classList.remove('hidden');
            }

            // Update navigation active state (sidebar only)
            const navLinks = document.querySelectorAll('nav a');
            navLinks.forEach(link => {
                link.classList.remove('text-white');
                link.classList.add('text-gray-700', 'hover:bg-gray-100');
                link.style.backgroundColor = '';
            });

            // Only set active nav item if the event exists and the target is inside the sidebar
            if (typeof event !== 'undefined' && event && event.target && event.target.closest && event.target.closest('nav')) {
                event.target.classList.remove('text-gray-700', 'hover:bg-gray-100');
                event.target.classList.add('text-white');
                event.target.style.backgroundColor = '#25c9d0';
            }
        }

        function toggleSection(menuId) {
            const menu = document.getElementById(menuId);
            const arrow = document.getElementById(menuId.replace('-menu', '-arrow'));

            if (menu.style.display === 'none' || menu.style.display === '') {
                menu.style.display = 'block';
                arrow.style.transform = 'rotate(180deg)';
            } else {
                menu.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
            }
        }

        function toggleSwitch(button) {
            const span = button.querySelector('span');
            const isOn = button.style.backgroundColor === 'rgb(37, 201, 208)' || button.style.backgroundColor === '#25c9d0';

            if (isOn) {
                button.style.backgroundColor = '#e5e7eb';
                span.classList.remove('translate-x-6');
                span.classList.add('translate-x-1');
            } else {
                button.style.backgroundColor = '#25c9d0';
                span.classList.remove('translate-x-1');
                span.classList.add('translate-x-6');
            }
        }



        // XML Beautifier Functions
        function beautifyXML() {
            const input = document.getElementById('xmlInput').value;
            const output = document.getElementById('xmlOutput');

            if (!input.trim()) {
                output.value = 'Error: Please enter XML to beautify';
                output.style.color = "red";
                return;
            }

            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(input, 'text/xml');

                const parseErrors = xmlDoc.getElementsByTagName('parsererror');
                if (parseErrors.length > 0) {
                    const errorText = parseErrors[0].textContent;
                    output.value = 'XML Validation Error:\n' + errorText;
                    output.style.color = "red";
                    return;
                }

                const serializer = new XMLSerializer();
                const formatted = formatXML(serializer.serializeToString(xmlDoc));
                output.value = formatted;
                output.style.color = "black"; // reset to normal color
            } catch (error) {
                output.value = 'Error: ' + error.message;
                output.style.color = "red";
            }
        }

        function formatXML(xml) {
            const pad = '  '; // 2 spaces per level
            // ensure tags are separated into lines
            xml = xml.replace(/>\s*</g, '>\n<').trim();
            const lines = xml.split('\n');
            let formatted = '';
            let indent = '';
            for (let rawLine of lines) {
                const line = rawLine.trim(); // <-- quan trọng: dùng trim để so sánh reliably
                // If line is a closing tag, outdent first
                if (/^<\/\w/.test(line)) {
                    indent = indent.slice(0, -pad.length);
                }
                formatted += indent + line + '\n';
                // If line is an opening tag (not self-closing), increase indent
                // - ignore XML declaration <?...?> and comments <!-- ... -->
                if (/^<\w[^>]*[^\/]>$/.test(line) && !/^<\?.*\?>$/.test(line) && !/^<!--/.test(line)) {
                    indent += pad;
                }
            }
            return formatted.trim();
        }

        function clearXML() {
            document.getElementById('xmlInput').value = '';
            document.getElementById('xmlOutput').value = '';
        }

        // JSON Beautifier Functions
        function beautifyJSON() {
            const input = document.getElementById('jsonInput').value;
            const output = document.getElementById('jsonOutput');

            if (!input.trim()) {
                output.value = 'Error: Please enter JSON to beautify';
                output.style.color = "red";
                return;
            }

            try {
                // Auto-detect Python dict-like input and convert to JSON if needed
                let toParse = input;
                if (isProbablyPythonDict(input)) {
                    try {
                        toParse = pythonDictToJson(input);
                    } catch (convErr) {
                        // conversion failed; leave toParse as original input
                        console.warn('pythonDictToJson failed', convErr);
                        toParse = input;
                    }
                } else {
                    // If the user enabled auto-replace, convert common single-quoted JSON to double-quoted JSON
                    const autoReplace = document.getElementById('jsonAutoReplaceQuotes');
                    if (autoReplace && autoReplace.checked) {
                        toParse = safeSingleToDoubleQuotes(input);
                    }
                }

                const parsed = JSON.parse(toParse);
                output.value = JSON.stringify(parsed, null, 2);
                output.style.color = "black"; // reset to normal color
            } catch (error) {
                // Parse error message to provide better feedback
                let errorMsg = error.message;
                const positionMatch = errorMsg.match(/position (\d+)/);
                if (positionMatch) {
                    const position = parseInt(positionMatch[1]);
                    const lines = input.substring(0, position).split('\n');
                    errorMsg += `\nNear line ${lines.length}, column ${lines[lines.length - 1].length + 1}`;
                }
                output.value = 'JSON Validation Error:\n' + errorMsg;
                output.style.color = "red";
            }
        }


        // Convert many common single-quoted JSON-like strings into valid double-quoted JSON
        // This is conservative: it targets single-quoted string literals for keys and values,
        // and avoids changing apostrophes inside words where possible.
        function safeSingleToDoubleQuotes(str) {
            // Strategy:
            // 1) Replace single-quoted keys or values: '(...?)' -> "..." when the quotes appear
            //    as string boundaries (preceded/followed by whitespace, {, [, :, , or line boundaries).
            // 2) Avoid touching phrases like don't or O'Neil by requiring a boundary before and after.

            // Step 1: replace single-quoted occurrences that look like JSON string tokens
            // Regex explanation: (?<=[:\[{,\s])'((?:\\'|[^'])*)'(?=[,\]}:\s])
            // But JS doesn't support variable-width lookbehind in older engines, so we'll use a safe alternative.

            // Use a replacer that scans the string char-by-char to find single-quoted tokens in likely positions.
            let out = '';
            let i = 0;
            const len = str.length;
            while (i < len) {
                const ch = str[i];
                if (ch === "'") {
                    // check preceding character (or start) and following context to decide if this is a JSON string
                    const prev = i === 0 ? '\n' : str[i - 1];
                    // allow preceding chars that commonly appear before JSON strings
                    if (/[:\[\{,\s\n]/.test(prev)) {
                        // attempt to read until the next unescaped single quote
                        let j = i + 1;
                        let found = false;
                        let value = '';
                        while (j < len) {
                            const c = str[j];
                            if (c === "'" && str[j - 1] !== '\\') { found = true; break; }
                            value += c;
                            j++;
                        }
                        if (found) {
                            // Lookahead char after closing '
                            const next = j + 1 < len ? str[j + 1] : '\n';
                            if (/[,\]\}:\s\n]/.test(next)) {
                                // safe to replace this quoted token
                                // unescape any escaped single quotes inside and escape double quotes
                                const replaced = value.replace(/\\'/g, "'")
                                    .replace(/\\"/g, '"')
                                    .replace(/"/g, '\\"');
                                out += '"' + replaced + '"';
                                i = j + 1;
                                continue;
                            }
                        }
                    }
                }

                // default: copy character
                out += ch;
                i++;
            }

            return out;
        }

        // Heuristic: detect if the input looks like a Python dict/list literal
        function isProbablyPythonDict(s) {
            if (!s || typeof s !== 'string') return false;
            const trimmed = s.trim();
            // quick checks: uses Python None/True/False or single quotes for keys, or starts with { and contains ':'
            if (/\b(None|True|False)\b/.test(trimmed)) return true;
            if (/^\s*\{[\s\S]*:\s*['"]/m.test(trimmed)) return true;
            // also consider single-quoted keys/values
            if (/\'[^']+\'\s*:/m.test(trimmed)) return true;
            return false;
        }

        // Convert a Python dict/list literal-ish string into valid JSON string.
        // This is conservative: it handles common cases (single quotes, True/False/None, trailing commas).
        function pythonDictToJson(s) {
            let out = s.trim();
            // Replace Python True/False/None with JSON true/false/null but avoid inside strings by first
            // converting likely string tokens to double-quoted JSON strings.
            out = safeSingleToDoubleQuotes(out);

            // Remove Python-style trailing commas before } or ]
            out = out.replace(/,\s*([}\]])/g, '$1');

            // Replace bare True/False/None (outside of quotes) with JSON equivalents
            // At this point strings should be double quoted, so these replacements are safer.
            out = out.replace(/\bTrue\b/g, 'true');
            out = out.replace(/\bFalse\b/g, 'false');
            out = out.replace(/\bNone\b/g, 'null');

            return out;
        }

        function clearJSON() {
            document.getElementById('jsonInput').value = '';
            document.getElementById('jsonOutput').value = '';
        }

        // HTML Beautifier Functions

        function beautifyHTML() {
            const input = document.getElementById('htmlInput').value;
            const output = document.getElementById('htmlOutput');

            if (!input.trim()) {
                output.value = 'Error: Please enter HTML to beautify';
                output.style.color = "red";
                return;
            }

            // Validate first
            const validationErrors = validateHTMLSyntax(input);
            if (validationErrors.length > 0) {
                output.value = 'HTML Validation Errors:\n' + validationErrors.join('\n');
                output.style.color = "red";
                return;
            }

            try {
                const formatted = formatHTML(input);
                output.value = formatted;
                output.style.color = "black"; // reset to normal color
            } catch (error) {
                output.value = 'Error: ' + error.message;
                output.style.color = "red";
            }
        }

        function validateHTMLSyntax(html) {
            const errors = [];

            // Quick check: angle brackets balance
            const openBrackets = (html.match(/</g) || []).length;
            const closeBrackets = (html.match(/>/g) || []).length;
            if (openBrackets !== closeBrackets) {
                errors.push('Mismatched angle brackets - check for missing ">" or "<"');
            }

            // Extract tags
            const tagPattern = /<\/?([a-zA-Z0-9\-]+)(\s[^>]*)?>/g;
            const tags = [...html.matchAll(tagPattern)];

            const stack = [];
            const voidElements = new Set([
                'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
                'param', 'source', 'track', 'wbr'
            ]);

            tags.forEach(match => {
                const fullTag = match[0];
                const tagName = match[1].toLowerCase();
                const isClosing = fullTag.startsWith('</');
                const isSelfClosing = fullTag.endsWith('/>') || voidElements.has(tagName);

                if (isClosing) {
                    if (stack.length === 0) {
                        errors.push(`Unexpected closing tag </${tagName}>`);
                    } else {
                        const last = stack.pop();
                        if (last !== tagName) {
                            errors.push(`Mismatched closing tag </${tagName}> (expected </${last}>)`);
                        }
                    }
                } else if (!isSelfClosing) {
                    stack.push(tagName);
                }
            });

            // Any tags left open?
            if (stack.length > 0) {
                errors.push(`Unclosed tag(s): ${stack.map(t => `<${t}>`).join(', ')}`);
            }

            // Check for stray < or > in text
            const withoutTags = html.replace(/<[^>]*>/g, '');
            if (withoutTags.includes('<') || withoutTags.includes('>')) {
                errors.push('Unescaped "<" or ">" characters found in content - use &lt; and &gt;');
            }

            return errors;
        }

        function formatHTML(html) {
            const pad = '  '; // 2 spaces
            let formatted = '';
            let indent = '';

            // Normalize: split tags into separate lines
            html = html.replace(/>\s*</g, '>\n<').trim();
            const lines = html.split('\n');

            for (let raw of lines) {
                const line = raw.trim();

                // Closing tag → reduce indent first
                if (/^<\/\w/.test(line)) {
                    indent = indent.slice(0, -pad.length);
                }

                formatted += indent + line + '\n';

                // Opening tag (not self-closing, not void, not doctype/comment)
                if (
                    /^<\w[^>]*[^\/]>$/.test(line) &&
                    !/^(<!(?:DOCTYPE|--))/.test(line) &&
                    !/\/>$/.test(line) &&
                    !/^(<(?:(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr))\b)/i.test(line)
                ) {
                    indent += pad;
                }
            }

            return formatted.trim();
        }

        function clearHTML() {
            document.getElementById('htmlInput').value = '';
            document.getElementById('htmlOutput').value = '';
        }


        // Comprehensive timezone list with UTC offsets
        const timezones = [
            // UTC
            { value: 'UTC', label: 'UTC+00:00 - Coordinated Universal Time', offset: '+00:00' },

            // Americas - West to East
            { value: 'Pacific/Honolulu', label: 'UTC-10:00 - Hawaii Time (Honolulu)', offset: '-10:00' },
            { value: 'America/Anchorage', label: 'UTC-09:00 - Alaska Time (Anchorage)', offset: '-09:00' },
            { value: 'America/Los_Angeles', label: 'UTC-08:00 - Pacific Time (Los Angeles)', offset: '-08:00' },
            { value: 'America/Vancouver', label: 'UTC-08:00 - Pacific Time (Vancouver)', offset: '-08:00' },
            { value: 'America/Denver', label: 'UTC-07:00 - Mountain Time (Denver)', offset: '-07:00' },
            { value: 'America/Phoenix', label: 'UTC-07:00 - Mountain Time (Phoenix)', offset: '-07:00' },
            { value: 'America/Chicago', label: 'UTC-06:00 - Central Time (Chicago)', offset: '-06:00' },
            { value: 'America/Mexico_City', label: 'UTC-06:00 - Central Time (Mexico City)', offset: '-06:00' },
            { value: 'America/New_York', label: 'UTC-05:00 - Eastern Time (New York)', offset: '-05:00' },
            { value: 'America/Toronto', label: 'UTC-05:00 - Eastern Time (Toronto)', offset: '-05:00' },
            { value: 'America/Bogota', label: 'UTC-05:00 - Colombia Time (Bogotá)', offset: '-05:00' },
            { value: 'America/Lima', label: 'UTC-05:00 - Peru Time (Lima)', offset: '-05:00' },
            { value: 'America/Caracas', label: 'UTC-04:00 - Venezuela Time (Caracas)', offset: '-04:00' },
            { value: 'America/Santiago', label: 'UTC-04:00 - Chile Time (Santiago)', offset: '-04:00' },
            { value: 'America/La_Paz', label: 'UTC-04:00 - Bolivia Time (La Paz)', offset: '-04:00' },
            { value: 'America/Sao_Paulo', label: 'UTC-03:00 - Brasília Time (São Paulo)', offset: '-03:00' },
            { value: 'America/Argentina/Buenos_Aires', label: 'UTC-03:00 - Argentina Time (Buenos Aires)', offset: '-03:00' },
            { value: 'America/Montevideo', label: 'UTC-03:00 - Uruguay Time (Montevideo)', offset: '-03:00' },
            { value: 'America/Noronha', label: 'UTC-02:00 - Fernando de Noronha Time', offset: '-02:00' },
            { value: 'Atlantic/Azores', label: 'UTC-01:00 - Azores Time', offset: '-01:00' },

            // Europe & Africa - West to East
            { value: 'Europe/London', label: 'UTC+00:00 - Greenwich Mean Time (London)', offset: '+00:00' },
            { value: 'Africa/Casablanca', label: 'UTC+01:00 - Western European Time (Casablanca)', offset: '+01:00' },
            { value: 'Europe/Paris', label: 'UTC+01:00 - Central European Time (Paris)', offset: '+01:00' },
            { value: 'Europe/Berlin', label: 'UTC+01:00 - Central European Time (Berlin)', offset: '+01:00' },
            { value: 'Europe/Rome', label: 'UTC+01:00 - Central European Time (Rome)', offset: '+01:00' },
            { value: 'Europe/Madrid', label: 'UTC+01:00 - Central European Time (Madrid)', offset: '+01:00' },
            { value: 'Europe/Amsterdam', label: 'UTC+01:00 - Central European Time (Amsterdam)', offset: '+01:00' },
            { value: 'Europe/Brussels', label: 'UTC+01:00 - Central European Time (Brussels)', offset: '+01:00' },
            { value: 'Europe/Vienna', label: 'UTC+01:00 - Central European Time (Vienna)', offset: '+01:00' },
            { value: 'Europe/Zurich', label: 'UTC+01:00 - Central European Time (Zurich)', offset: '+01:00' },
            { value: 'Europe/Stockholm', label: 'UTC+01:00 - Central European Time (Stockholm)', offset: '+01:00' },
            { value: 'Europe/Oslo', label: 'UTC+01:00 - Central European Time (Oslo)', offset: '+01:00' },
            { value: 'Europe/Copenhagen', label: 'UTC+01:00 - Central European Time (Copenhagen)', offset: '+01:00' },
            { value: 'Europe/Warsaw', label: 'UTC+01:00 - Central European Time (Warsaw)', offset: '+01:00' },
            { value: 'Europe/Prague', label: 'UTC+01:00 - Central European Time (Prague)', offset: '+01:00' },
            { value: 'Europe/Budapest', label: 'UTC+01:00 - Central European Time (Budapest)', offset: '+01:00' },
            { value: 'Africa/Lagos', label: 'UTC+01:00 - West Africa Time (Lagos)', offset: '+01:00' },
            { value: 'Africa/Algiers', label: 'UTC+01:00 - Central European Time (Algiers)', offset: '+01:00' },
            { value: 'Africa/Tunis', label: 'UTC+01:00 - Central European Time (Tunis)', offset: '+01:00' },
            { value: 'Europe/Helsinki', label: 'UTC+02:00 - Eastern European Time (Helsinki)', offset: '+02:00' },
            { value: 'Europe/Bucharest', label: 'UTC+02:00 - Eastern European Time (Bucharest)', offset: '+02:00' },
            { value: 'Europe/Athens', label: 'UTC+02:00 - Eastern European Time (Athens)', offset: '+02:00' },
            { value: 'Europe/Kiev', label: 'UTC+02:00 - Eastern European Time (Kiev)', offset: '+02:00' },
            { value: 'Africa/Cairo', label: 'UTC+02:00 - Eastern European Time (Cairo)', offset: '+02:00' },
            { value: 'Africa/Johannesburg', label: 'UTC+02:00 - South Africa Standard Time', offset: '+02:00' },
            { value: 'Europe/Istanbul', label: 'UTC+03:00 - Turkey Time (Istanbul)', offset: '+03:00' },
            { value: 'Europe/Moscow', label: 'UTC+03:00 - Moscow Standard Time', offset: '+03:00' },
            { value: 'Africa/Nairobi', label: 'UTC+03:00 - East Africa Time (Nairobi)', offset: '+03:00' },
            { value: 'Asia/Riyadh', label: 'UTC+03:00 - Arabia Standard Time (Riyadh)', offset: '+03:00' },
            { value: 'Asia/Baghdad', label: 'UTC+03:00 - Arabia Standard Time (Baghdad)', offset: '+03:00' },
            { value: 'Asia/Tehran', label: 'UTC+03:30 - Iran Standard Time (Tehran)', offset: '+03:30' },
            { value: 'Asia/Dubai', label: 'UTC+04:00 - Gulf Standard Time (Dubai)', offset: '+04:00' },
            { value: 'Asia/Baku', label: 'UTC+04:00 - Azerbaijan Time (Baku)', offset: '+04:00' },
            { value: 'Asia/Yerevan', label: 'UTC+04:00 - Armenia Time (Yerevan)', offset: '+04:00' },
            { value: 'Asia/Kabul', label: 'UTC+04:30 - Afghanistan Time (Kabul)', offset: '+04:30' },
            { value: 'Asia/Karachi', label: 'UTC+05:00 - Pakistan Standard Time (Karachi)', offset: '+05:00' },
            { value: 'Asia/Tashkent', label: 'UTC+05:00 - Uzbekistan Time (Tashkent)', offset: '+05:00' },
            { value: 'Asia/Yekaterinburg', label: 'UTC+05:00 - Yekaterinburg Time', offset: '+05:00' },
            { value: 'Asia/Kolkata', label: 'UTC+05:30 - India Standard Time (Mumbai)', offset: '+05:30' },
            { value: 'Asia/Colombo', label: 'UTC+05:30 - Sri Lanka Time (Colombo)', offset: '+05:30' },
            { value: 'Asia/Kathmandu', label: 'UTC+05:45 - Nepal Time (Kathmandu)', offset: '+05:45' },
            { value: 'Asia/Dhaka', label: 'UTC+06:00 - Bangladesh Standard Time (Dhaka)', offset: '+06:00' },
            { value: 'Asia/Almaty', label: 'UTC+06:00 - Kazakhstan Time (Almaty)', offset: '+06:00' },
            { value: 'Asia/Novosibirsk', label: 'UTC+07:00 - Novosibirsk Time', offset: '+07:00' },
            { value: 'Asia/Bangkok', label: 'UTC+07:00 - Indochina Time (Bangkok)', offset: '+07:00' },
            { value: 'Asia/Jakarta', label: 'UTC+07:00 - Western Indonesia Time (Jakarta)', offset: '+07:00' },
            { value: 'Asia/Ho_Chi_Minh', label: 'UTC+07:00 - Indochina Time (Ho Chi Minh)', offset: '+07:00' },
            { value: 'Asia/Shanghai', label: 'UTC+08:00 - China Standard Time (Shanghai)', offset: '+08:00' },
            { value: 'Asia/Hong_Kong', label: 'UTC+08:00 - Hong Kong Time', offset: '+08:00' },
            { value: 'Asia/Singapore', label: 'UTC+08:00 - Singapore Standard Time', offset: '+08:00' },
            { value: 'Asia/Manila', label: 'UTC+08:00 - Philippine Standard Time (Manila)', offset: '+08:00' },
            { value: 'Asia/Kuala_Lumpur', label: 'UTC+08:00 - Malaysia Time (Kuala Lumpur)', offset: '+08:00' },
            { value: 'Asia/Taipei', label: 'UTC+08:00 - Taiwan Time (Taipei)', offset: '+08:00' },
            { value: 'Australia/Perth', label: 'UTC+08:00 - Australian Western Time (Perth)', offset: '+08:00' },
            { value: 'Asia/Irkutsk', label: 'UTC+08:00 - Irkutsk Time', offset: '+08:00' },
            { value: 'Asia/Seoul', label: 'UTC+09:00 - Korea Standard Time (Seoul)', offset: '+09:00' },
            { value: 'Asia/Tokyo', label: 'UTC+09:00 - Japan Standard Time (Tokyo)', offset: '+09:00' },
            { value: 'Asia/Yakutsk', label: 'UTC+09:00 - Yakutsk Time', offset: '+09:00' },
            { value: 'Australia/Darwin', label: 'UTC+09:30 - Australian Central Time (Darwin)', offset: '+09:30' },
            { value: 'Australia/Adelaide', label: 'UTC+09:30 - Australian Central Time (Adelaide)', offset: '+09:30' },
            { value: 'Australia/Sydney', label: 'UTC+10:00 - Australian Eastern Time (Sydney)', offset: '+10:00' },
            { value: 'Australia/Melbourne', label: 'UTC+10:00 - Australian Eastern Time (Melbourne)', offset: '+10:00' },
            { value: 'Australia/Brisbane', label: 'UTC+10:00 - Australian Eastern Time (Brisbane)', offset: '+10:00' },
            { value: 'Asia/Vladivostok', label: 'UTC+10:00 - Vladivostok Time', offset: '+10:00' },
            { value: 'Pacific/Guam', label: 'UTC+10:00 - Chamorro Standard Time (Guam)', offset: '+10:00' },
            { value: 'Asia/Magadan', label: 'UTC+11:00 - Magadan Time', offset: '+11:00' },
            { value: 'Pacific/Norfolk', label: 'UTC+11:00 - Norfolk Island Time', offset: '+11:00' },
            { value: 'Pacific/Auckland', label: 'UTC+12:00 - New Zealand Standard Time (Auckland)', offset: '+12:00' },
            { value: 'Pacific/Fiji', label: 'UTC+12:00 - Fiji Time', offset: '+12:00' },
            { value: 'Asia/Kamchatka', label: 'UTC+12:00 - Kamchatka Time', offset: '+12:00' },
            { value: 'Pacific/Tongatapu', label: 'UTC+13:00 - Tonga Time', offset: '+13:00' },
            { value: 'Pacific/Apia', label: 'UTC+13:00 - Samoa Time (Apia)', offset: '+13:00' },
            { value: 'Pacific/Kiritimati', label: 'UTC+14:00 - Line Islands Time', offset: '+14:00' }
        ];

        let timezoneConverterCount = 0;

        // Timezone Converter Functions
        function populateTimezoneSelects() {
            const sourceSelect = document.getElementById('sourceTimezone');

            // Clear existing options
            sourceSelect.innerHTML = '';

            // Add "Local Time" as first option
            const localOption = document.createElement('option');
            localOption.value = 'LOCAL';
            localOption.textContent = 'Local Time (Your Device Timezone)';
            sourceSelect.appendChild(localOption);

            // Add timezone options
            timezones.forEach(tz => {
                const option = document.createElement('option');
                option.value = tz.value;
                option.textContent = tz.label;
                sourceSelect.appendChild(option);
            });

            // Set default to Local Time
            sourceSelect.value = 'LOCAL';
        }

        function addTimezoneConverter() {
            if (timezoneConverterCount >= 5) {
                alert('Maximum 5 timezone conversions allowed');
                return;
            }

            timezoneConverterCount++;
            const container = document.getElementById('timezoneConverters');

            const converterDiv = document.createElement('div');
            converterDiv.className = 'flex items-center gap-3 p-3 bg-gray-50 rounded-lg';
            converterDiv.id = `converter-${timezoneConverterCount}`;

            const timezoneOptions = [
                '<option value="LOCAL">Local Time (Your Device Timezone)</option>',
                ...timezones.map(tz => `<option value="${tz.value}">${tz.label}</option>`)
            ].join('');

            converterDiv.innerHTML = `
                <div class="flex-1">
                    <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" id="targetTimezone-${timezoneConverterCount}">
                        ${timezoneOptions}
                    </select>
                </div>
                <div class="flex-2 min-w-0">
                    <div class="px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm text-gray-600" id="result-${timezoneConverterCount}">
                        Click "Convert All" to see result
                    </div>
                </div>
                <button onclick="removeTimezoneConverter(${timezoneConverterCount})" class="text-red-600 hover:text-red-800 p-1">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            `;

            container.appendChild(converterDiv);

            // Set default timezone (different from source)
            const targetSelect = document.getElementById(`targetTimezone-${timezoneConverterCount}`);
            const sourceTimezone = document.getElementById('sourceTimezone').value;

            // Set to a different timezone than source
            if (sourceTimezone === 'LOCAL') {
                targetSelect.value = 'UTC';
            } else if (sourceTimezone === 'UTC') {
                targetSelect.value = 'America/New_York';
            } else {
                targetSelect.value = 'UTC';
            }

            // Update button state
            updateAddButton();
        }

        function removeTimezoneConverter(id) {
            const converter = document.getElementById(`converter-${id}`);
            if (converter) {
                converter.remove();
                timezoneConverterCount--;
                updateAddButton();
            }
        }

        function updateAddButton() {
            const addBtn = document.getElementById('addTimezoneBtn');
            if (timezoneConverterCount >= 5) {
                addBtn.disabled = true;
                addBtn.textContent = 'Maximum 5 timezones';
                addBtn.className = 'bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium cursor-not-allowed';
            } else {
                addBtn.disabled = false;
                addBtn.textContent = '+ Add Timezone';
                addBtn.className = 'bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors';
            }
        }

        function convertAllTimezones() {
            const sourceTimezone = document.getElementById('sourceTimezone').value;
            const dateTime = document.getElementById('inputDateTime').value;
            const resultsContainer = document.getElementById('conversionResults');

            if (!dateTime) {
                alert('Please select a date and time');
                return;
            }

            try {
                let sourceDate;

                if (sourceTimezone === 'LOCAL') {
                    // Treat input as local time
                    sourceDate = new Date(dateTime);
                } else {
                    // Create date in specified timezone
                    sourceDate = new Date(dateTime);
                }

                // Clear previous results
                resultsContainer.innerHTML = '';

                // Show source time
                const sourceResult = document.createElement('div');
                sourceResult.className = 'p-4 bg-blue-50 border border-blue-200 rounded-lg';
                const sourceLabel = sourceTimezone === 'LOCAL' ? 'Source Time (Local)' : 'Source Time';
                sourceResult.innerHTML = `
                    <div class="font-medium text-blue-900 mb-1">${sourceLabel}</div>
                    <div class="text-lg font-mono text-blue-800">${formatDateTime(sourceDate, sourceTimezone)}</div>
                `;
                resultsContainer.appendChild(sourceResult);

                // Convert to each target timezone
                for (let i = 1; i <= timezoneConverterCount; i++) {
                    const targetSelect = document.getElementById(`targetTimezone-${i}`);
                    const resultDiv = document.getElementById(`result-${i}`);

                    if (targetSelect && resultDiv) {
                        const targetTimezone = targetSelect.value;
                        const convertedTime = formatDateTime(sourceDate, targetTimezone);
                        resultDiv.textContent = convertedTime;
                        resultDiv.className = 'px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm text-gray-900';
                    }
                }

            } catch (error) {
                alert('Error converting timezones: ' + error.message);
            }
        }

        function formatDateTime(date, timezone) {
            if (timezone === 'LOCAL') {
                // Format in local timezone with ISO 8601 style
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');

                // Get timezone offset
                const offset = -date.getTimezoneOffset();
                const offsetHours = Math.floor(Math.abs(offset) / 60);
                const offsetMinutes = Math.abs(offset) % 60;
                const offsetSign = offset >= 0 ? '+' : '-';
                const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;

                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetString}`;
            } else {
                // Format in specified timezone with ISO 8601 style
                const options = {
                    timeZone: timezone,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                };

                const formatted = new Intl.DateTimeFormat('en-CA', options).format(date);
                const [datePart, timePart] = formatted.split(', ');

                // Get timezone offset for the specified timezone
                const tempDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
                const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
                const offset = (tempDate.getTime() - utcDate.getTime()) / (1000 * 60);

                const offsetHours = Math.floor(Math.abs(offset) / 60);
                const offsetMinutes = Math.abs(offset) % 60;
                const offsetSign = offset >= 0 ? '+' : '-';
                const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;

                return `${datePart}T${timePart}${offsetString}`;
            }
        }

        function clearAllTimezones() {
            // Clear input
            document.getElementById('inputDateTime').value = '';

            // Remove all converters
            const container = document.getElementById('timezoneConverters');
            container.innerHTML = '';
            timezoneConverterCount = 0;

            // Clear results
            document.getElementById('conversionResults').innerHTML = '';

            // Update button
            updateAddButton();
        }

        function setCurrentTime() {
            const now = new Date();
            const localDateTime = now.getFullYear() + '-' +
                String(now.getMonth() + 1).padStart(2, '0') + '-' +
                String(now.getDate()).padStart(2, '0') + 'T' +
                String(now.getHours()).padStart(2, '0') + ':' +
                String(now.getMinutes()).padStart(2, '0');

            document.getElementById('inputDateTime').value = localDateTime;
        }

        // XML to CSV Converter Functions
        function convertXmlToCsv() {
            const input = document.getElementById('xmlCsvInput').value;
            const output = document.getElementById('xmlCsvOutput');
            const rootElement = document.getElementById('xmlRootElement').value.trim();
            const includeAttributes = document.getElementById('includeAttributes').checked;

            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(input, 'text/xml');

                // Check for parsing errors
                const parseErrors = xmlDoc.getElementsByTagName('parsererror');
                if (parseErrors.length > 0) {
                    throw new Error('Invalid XML: ' + parseErrors[0].textContent);
                }

                let elements;
                if (rootElement) {
                    elements = xmlDoc.getElementsByTagName(rootElement);
                } else {
                    // Auto-detect repeating elements
                    const allElements = xmlDoc.getElementsByTagName('*');
                    const elementCounts = {};

                    for (let i = 0; i < allElements.length; i++) {
                        const tagName = allElements[i].tagName;
                        elementCounts[tagName] = (elementCounts[tagName] || 0) + 1;
                    }

                    // Find the most common element (likely the row element)
                    let maxCount = 0;
                    let mostCommonElement = '';
                    for (const [tagName, count] of Object.entries(elementCounts)) {
                        if (count > maxCount && count > 1) {
                            maxCount = count;
                            mostCommonElement = tagName;
                        }
                    }

                    if (mostCommonElement) {
                        elements = xmlDoc.getElementsByTagName(mostCommonElement);
                    } else {
                        throw new Error('Could not detect repeating elements. Please specify a root element.');
                    }
                }

                if (elements.length === 0) {
                    throw new Error(`No elements found with tag name: ${rootElement || 'auto-detected'}`);
                }

                // Extract headers from first element
                const headers = new Set();
                const firstElement = elements[0];

                // Add attributes as headers if enabled
                if (includeAttributes && firstElement.attributes) {
                    for (let i = 0; i < firstElement.attributes.length; i++) {
                        headers.add('@' + firstElement.attributes[i].name);
                    }
                }

                // Add child element names as headers
                const childNodes = firstElement.children;
                for (let i = 0; i < childNodes.length; i++) {
                    headers.add(childNodes[i].tagName);
                }

                // Convert to array and sort for consistent order
                const headerArray = Array.from(headers).sort();

                if (headerArray.length === 0) {
                    throw new Error('No data fields found in XML elements');
                }

                // Build CSV
                let csv = headerArray.join(',') + '\n';

                // Process each element
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i];
                    const row = [];

                    for (const header of headerArray) {
                        let value = '';

                        if (header.startsWith('@')) {
                            // Attribute
                            const attrName = header.substring(1);
                            value = element.getAttribute(attrName) || '';
                        } else {
                            // Child element
                            const childElement = element.getElementsByTagName(header)[0];
                            if (childElement) {
                                value = childElement.textContent || '';
                            }
                        }

                        // Escape CSV values
                        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                            value = '"' + value.replace(/"/g, '""') + '"';
                        }

                        row.push(value);
                    }

                    csv += row.join(',') + '\n';
                }

                output.value = csv;

            } catch (error) {
                output.value = 'Error: ' + error.message;
                output.style.color = "red";
            }
        }

        function downloadXmlCsv() {
            const csvContent = document.getElementById('xmlCsvOutput').value;

            if (!csvContent || csvContent.trim() === '' || csvContent.startsWith('Error:')) {
                alert('Please convert XML to CSV first');
                return;
            }

            try {
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = getDownloadFilename('csv');
                document.body.appendChild(a);
                a.click();

                // Clean up
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);

            } catch (error) {
                alert('Error downloading file: ' + error.message);
            }
        }

        function clearXmlCsv() {
            document.getElementById('xmlCsvInput').value = '';
            document.getElementById('xmlCsvOutput').value = '';
            document.getElementById('xmlFileInput').value = '';
            document.getElementById('xmlRootElement').value = 'user';
            document.getElementById('includeAttributes').checked = true;
            hideXmlUploadStatus();
        }

        // File Upload Functions for XML to CSV
        function handleXmlFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            // Validate file type
            const validTypes = ['application/xml', 'text/xml', 'text/plain'];
            const validExtensions = ['.xml', '.txt'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

            if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
                showXmlUploadStatus('Please select an XML or text file', 'error');
                return;
            }

            // Check file size (limit to 1GB)
            if (file.size > 1024 * 1024 * 1024) {
                showXmlUploadStatus('File size must be less than 1GB', 'error');
                return;
            }

            showXmlUploadStatus('Reading file...', 'loading');

            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const content = e.target.result;

                    // Basic XML validation
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(content, 'text/xml');
                    const parseErrors = xmlDoc.getElementsByTagName('parsererror');

                    if (parseErrors.length > 0) {
                        throw new Error('Invalid XML file: ' + parseErrors[0].textContent);
                    }

                    // Load into textarea
                    document.getElementById('xmlCsvInput').value = content;
                    showXmlUploadStatus(`File "${file.name}" loaded successfully!`, 'success');

                    // Auto-convert if it's valid XML
                    setTimeout(() => {
                        convertXmlToCsv();
                    }, 600000); // 10 minutes delay before auto-convert

                } catch (error) {
                    showXmlUploadStatus('Invalid XML file: ' + error.message, 'error');
                }
            };

            reader.onerror = function () {
                showXmlUploadStatus('Error reading file', 'error');
            };

            reader.readAsText(file);
        }

        function showXmlUploadStatus(message, type) {
            const statusDiv = document.getElementById('xmlUploadStatus');
            statusDiv.textContent = message;
            statusDiv.className = 'mt-2 text-sm';

            if (type === 'success') {
                statusDiv.className += ' text-green-600';
            } else if (type === 'error') {
                statusDiv.className += ' text-red-600';
            } else if (type === 'loading') {
                statusDiv.className += ' text-blue-600';
            }

            statusDiv.classList.remove('hidden');

            // Auto-hide success/error messages after 3 seconds
            if (type !== 'loading') {
                setTimeout(() => {
                    hideXmlUploadStatus();
                }, 3000);
            }
        }

        function hideXmlUploadStatus() {
            document.getElementById('xmlUploadStatus').classList.add('hidden');
        }

        // XML Drag and Drop functionality
        function setupXmlDragAndDrop() {
            const dropZone = document.getElementById('xmlDropZone');

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, preventDefaults, false);
            });

            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }

            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, highlightXml, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, unhighlightXml, false);
            });

            function highlightXml() {
                dropZone.classList.add('border-green-500', 'bg-green-100');
                dropZone.classList.remove('border-gray-300');
            }

            function unhighlightXml() {
                dropZone.classList.remove('border-green-500', 'bg-green-100');
                dropZone.classList.add('border-gray-300');
            }

            dropZone.addEventListener('drop', handleXmlDrop, false);

            function handleXmlDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;

                if (files.length > 0) {
                    const file = files[0];

                    // Create a fake event object for handleXmlFileUpload
                    const fakeEvent = {
                        target: {
                            files: [file]
                        }
                    };

                    handleXmlFileUpload(fakeEvent);
                }
            }
        }

        // JSON to CSV Converter Functions
        function convertJsonToCsv() {
            const input = document.getElementById('jsonCsvInput').value;
            const output = document.getElementById('csvOutput');

            try {
                const data = JSON.parse(input);

                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error('Input must be a non-empty array of objects');
                }

                const headers = Object.keys(data[0]);
                let csv = headers.join(',') + '\n';

                data.forEach(row => {
                    const values = headers.map(header => {
                        const value = row[header];
                        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
                    });
                    csv += values.join(',') + '\n';
                });

                output.value = csv;
            } catch (error) {
                output.value = 'Error: ' + error.message;
                output.style.color = "red";
            }
        }

        function downloadCsv() {
            const csvContent = document.getElementById('csvOutput').value;

            if (!csvContent || csvContent.trim() === '' || csvContent.startsWith('Error:')) {
                alert('Please convert JSON to CSV first');
                return;
            }

            try {
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = getDownloadFilename('csv');
                document.body.appendChild(a);
                a.click();

                // Clean up
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);

            } catch (error) {
                alert('Error downloading file: ' + error.message);
            }
        }

        function clearJsonCsv() {
            document.getElementById('jsonCsvInput').value = '';
            document.getElementById('csvOutput').value = '';
            document.getElementById('jsonFileInput').value = '';
            hideUploadStatus();
        }

        // File Upload Functions for JSON to CSV
        function handleJsonFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            // Validate file type
            const validTypes = ['application/json', 'text/plain', 'text/json'];
            const validExtensions = ['.json', '.txt'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

            if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
                showUploadStatus('Please select a JSON or text file', 'error');
                return;
            }

            // Check file size (limit to 1GB)
            if (file.size > 1024 * 1024 * 1024) {
                showUploadStatus('File size must be less than 1GB', 'error');
                return;
            }

            showUploadStatus('Reading file...', 'loading');

            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const content = e.target.result;

                    // Validate JSON
                    JSON.parse(content);

                    // Load into textarea
                    document.getElementById('jsonCsvInput').value = content;
                    showUploadStatus(`File "${file.name}" loaded successfully!`, 'success');

                    // Auto-convert if it's valid JSON array
                    setTimeout(() => {
                        convertJsonToCsv();
                    }, 600000); // 10 minutes delay for large files

                } catch (error) {
                    showUploadStatus('Invalid JSON file: ' + error.message, 'error');
                }
            };

            reader.onerror = function () {
                showUploadStatus('Error reading file', 'error');
            };

            reader.readAsText(file);
        }

        function showUploadStatus(message, type) {
            const statusDiv = document.getElementById('uploadStatus');
            statusDiv.textContent = message;
            statusDiv.className = 'mt-2 text-sm';

            if (type === 'success') {
                statusDiv.className += ' text-green-600';
            } else if (type === 'error') {
                statusDiv.className += ' text-red-600';
            } else if (type === 'loading') {
                statusDiv.className += ' text-blue-600';
            }

            statusDiv.classList.remove('hidden');

            // Auto-hide success/error messages after 3 seconds
            if (type !== 'loading') {
                setTimeout(() => {
                    hideUploadStatus();
                }, 3000);
            }
        }

        function hideUploadStatus() {
            document.getElementById('uploadStatus').classList.add('hidden');
        }

        // Drag and Drop functionality
        function setupDragAndDrop() {
            const dropZone = document.getElementById('dropZone');

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, preventDefaults, false);
            });

            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }

            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, highlight, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, unhighlight, false);
            });

            function highlight() {
                dropZone.classList.add('border-blue-500', 'bg-blue-100');
                dropZone.classList.remove('border-gray-300');
            }

            function unhighlight() {
                dropZone.classList.remove('border-blue-500', 'bg-blue-100');
                dropZone.classList.add('border-gray-300');
            }

            dropZone.addEventListener('drop', handleDrop, false);

            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;

                if (files.length > 0) {
                    const file = files[0];

                    // Create a fake event object for handleJsonFileUpload
                    const fakeEvent = {
                        target: {
                            files: [file]
                        }
                    };

                    handleJsonFileUpload(fakeEvent);
                }
            }
        }

        // JSON Filter Functions
        let jsonFilterFieldCount = 0;

        function addJsonFilterField() {
            if (jsonFilterFieldCount >= 10) {
                alert('Maximum 10 filter fields allowed');
                return;
            }

            jsonFilterFieldCount++;
            const container = document.getElementById('jsonFilterFields');

            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'flex items-center gap-3 p-3 bg-white border border-gray-300 rounded-lg';
            fieldDiv.id = `jsonFilterField-${jsonFilterFieldCount}`;

            fieldDiv.innerHTML = `
                <div class="flex-1">
                    <input type="text" placeholder="Field name (e.g., name, age)" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" id="jsonFieldName-${jsonFilterFieldCount}">
                </div>
                <div class="flex-1">
                    <select class="w-full px-3 py-2 border border-gray-300 rounded text-sm" id="jsonOperator-${jsonFilterFieldCount}">
                        <option value="equals">Equals</option>
                        <option value="not_equals">Not Equals</option>
                        <option value="contains">Contains</option>
                        <option value="not_contains">Not Contains</option>
                        <option value="greater_than">Greater Than</option>
                        <option value="less_than">Less Than</option>
                        <option value="greater_equal">Greater or Equal</option>
                        <option value="less_equal">Less or Equal</option>
                        <option value="starts_with">Starts With</option>
                        <option value="ends_with">Ends With</option>
                    </select>
                </div>
                <div class="flex-1">
                    <input type="text" placeholder="Value" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" id="jsonFieldValue-${jsonFilterFieldCount}">
                </div>
                <button onclick="removeJsonFilterField(${jsonFilterFieldCount})" class="text-red-600 hover:text-red-800 p-1">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            `;

            container.appendChild(fieldDiv);
            updateJsonFilterButton();
        }

        function removeJsonFilterField(id) {
            const field = document.getElementById(`jsonFilterField-${id}`);
            if (field) {
                field.remove();
                jsonFilterFieldCount--;
                updateJsonFilterButton();
            }
        }

        function updateJsonFilterButton() {
            const addBtn = document.getElementById('addJsonFilterBtn');
            if (jsonFilterFieldCount >= 10) {
                addBtn.disabled = true;
                addBtn.textContent = 'Maximum 10 filters';
                addBtn.className = 'bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium cursor-not-allowed';
            } else {
                addBtn.disabled = false;
                addBtn.textContent = '+ Add Filter';
                addBtn.className = 'bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors';
            }
        }

        function applyJsonFilter() {
            const input = document.getElementById('jsonFilterInput').value;
            const arrayPath = document.getElementById('jsonArrayPath').value.trim();
            const logicOperator = document.getElementById('jsonLogicOperator').value;
            const output = document.getElementById('jsonFilterOutput');

            try {
                const data = JSON.parse(input);

                // Get the array to filter
                let arrayToFilter;
                if (arrayPath) {
                    const parts = arrayPath.split('.');
                    arrayToFilter = data;
                    for (const part of parts) {
                        if (arrayToFilter && typeof arrayToFilter === 'object') {
                            arrayToFilter = arrayToFilter[part];
                        } else {
                            throw new Error(`Path "${arrayPath}" not found in data`);
                        }
                    }
                } else {
                    arrayToFilter = Array.isArray(data) ? data : [data];
                }

                if (!Array.isArray(arrayToFilter)) {
                    throw new Error('Selected path does not contain an array');
                }

                // Collect filter conditions
                const conditions = [];
                for (let i = 1; i <= jsonFilterFieldCount; i++) {
                    const fieldName = document.getElementById(`jsonFieldName-${i}`);
                    const operator = document.getElementById(`jsonOperator-${i}`);
                    const fieldValue = document.getElementById(`jsonFieldValue-${i}`);

                    if (fieldName && operator && fieldValue && fieldName.value.trim()) {
                        conditions.push({
                            field: fieldName.value.trim(),
                            operator: operator.value,
                            value: fieldValue.value
                        });
                    }
                }

                if (conditions.length === 0) {
                    output.value = JSON.stringify(arrayToFilter, null, 2);
                    return;
                }


                // Enhanced: support filtering by nested array/object fields (e.g., batters.batter.id or topping.id)
                function matchConditionDeep(item, fieldPath, operator, value) {
                    const parts = fieldPath.split('.');
                    let current = item;
                    for (let i = 0; i < parts.length; i++) {
                        if (Array.isArray(current)) {
                            // If current is array, check if any element matches the rest of the path
                            return current.some(el => matchConditionDeep(el, parts.slice(i).join('.'), operator, value));
                        } else if (current && typeof current === 'object') {
                            current = current[parts[i]];
                        } else {
                            return false;
                        }
                    }
                    // At the leaf, evaluate the condition
                    if (Array.isArray(current)) {
                        // If leaf is array, match any element
                        return current.some(el => evaluateCondition(el, operator, value));
                    } else {
                        return evaluateCondition(current, operator, value);
                    }
                }

                const filteredData = arrayToFilter.filter(item => {
                    const results = conditions.map(condition => {
                        return matchConditionDeep(item, condition.field, condition.operator, condition.value);
                    });
                    return logicOperator === 'AND' ? results.every(r => r) : results.some(r => r);
                });

                output.value = JSON.stringify(filteredData, null, 2);

            } catch (error) {
                output.value = 'Error: ' + error.message;
                output.style.color = "red";
            }
        }

        function getNestedValue(obj, path) {
            const parts = path.split('.');
            let value = obj;
            for (const part of parts) {
                if (value && typeof value === 'object') {
                    value = value[part];
                } else {
                    return undefined;
                }
            }
            return value;
        }

        function evaluateCondition(fieldValue, operator, targetValue) {
            // Convert values for comparison
            const fieldStr = String(fieldValue || '').toLowerCase();
            const targetStr = String(targetValue).toLowerCase();
            const fieldNum = parseFloat(fieldValue);
            const targetNum = parseFloat(targetValue);

            switch (operator) {
                case 'equals':
                    return fieldValue == targetValue;
                case 'not_equals':
                    return fieldValue != targetValue;
                case 'contains':
                    return fieldStr.includes(targetStr);
                case 'not_contains':
                    return !fieldStr.includes(targetStr);
                case 'greater_than':
                    return !isNaN(fieldNum) && !isNaN(targetNum) && fieldNum > targetNum;
                case 'less_than':
                    return !isNaN(fieldNum) && !isNaN(targetNum) && fieldNum < targetNum;
                case 'greater_equal':
                    return !isNaN(fieldNum) && !isNaN(targetNum) && fieldNum >= targetNum;
                case 'less_equal':
                    return !isNaN(fieldNum) && !isNaN(targetNum) && fieldNum <= targetNum;
                case 'starts_with':
                    return fieldStr.startsWith(targetStr);
                case 'ends_with':
                    return fieldStr.endsWith(targetStr);
                default:
                    return false;
            }
        }

        function downloadJsonFilter() {
            const content = document.getElementById('jsonFilterOutput').value;

            if (!content || content.trim() === '' || content.startsWith('Error:')) {
                alert('Please apply a filter first');
                return;
            }

            try {
                const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = getDownloadFilename('json');
                document.body.appendChild(a);
                a.click();

                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);

            } catch (error) {
                alert('Error downloading file: ' + error.message);
            }
        }

        function clearJsonFilter() {
            document.getElementById('jsonFilterInput').value = '';
            document.getElementById('jsonFilterOutput').value = '';
            document.getElementById('jsonArrayPath').value = 'users';
            document.getElementById('jsonLogicOperator').value = 'AND';

            // Remove all filter fields
            const container = document.getElementById('jsonFilterFields');
            container.innerHTML = '';
            jsonFilterFieldCount = 0;
            updateJsonFilterButton();
        }

        // XML Filter Functions
        let xmlFilterFieldCount = 0;

        function addXmlFilterField() {
            if (xmlFilterFieldCount >= 10) {
                alert('Maximum 10 filter fields allowed');
                return;
            }

            xmlFilterFieldCount++;
            const container = document.getElementById('xmlFilterFields');

            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'flex items-center gap-3 p-3 bg-white border border-gray-300 rounded-lg';
            fieldDiv.id = `xmlFilterField-${xmlFilterFieldCount}`;

            fieldDiv.innerHTML = `
                <div class="flex-1">
                    <select class="w-full px-3 py-2 border border-gray-300 rounded text-sm" id="xmlFieldType-${xmlFilterFieldCount}">
                        <option value="element">Element</option>
                        <option value="attribute">Attribute</option>
                    </select>
                </div>
                <div class="flex-1">
                    <input type="text" placeholder="Field name" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" id="xmlFieldName-${xmlFilterFieldCount}">
                </div>
                <div class="flex-1">
                    <select class="w-full px-3 py-2 border border-gray-300 rounded text-sm" id="xmlOperator-${xmlFilterFieldCount}">
                        <option value="equals">Equals</option>
                        <option value="not_equals">Not Equals</option>
                        <option value="contains">Contains</option>
                        <option value="not_contains">Not Contains</option>
                        <option value="greater_than">Greater Than</option>
                        <option value="less_than">Less Than</option>
                        <option value="greater_equal">Greater or Equal</option>
                        <option value="less_equal">Less or Equal</option>
                        <option value="starts_with">Starts With</option>
                        <option value="ends_with">Ends With</option>
                    </select>
                </div>
                <div class="flex-1">
                    <input type="text" placeholder="Value" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" id="xmlFieldValue-${xmlFilterFieldCount}">
                </div>
                <button onclick="removeXmlFilterField(${xmlFilterFieldCount})" class="text-red-600 hover:text-red-800 p-1">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            `;

            container.appendChild(fieldDiv);
            updateXmlFilterButton();
        }

        function removeXmlFilterField(id) {
            const field = document.getElementById(`xmlFilterField-${id}`);
            if (field) {
                field.remove();
                xmlFilterFieldCount--;
                updateXmlFilterButton();
            }
        }

        function updateXmlFilterButton() {
            const addBtn = document.getElementById('addXmlFilterBtn');
            if (xmlFilterFieldCount >= 10) {
                addBtn.disabled = true;
                addBtn.textContent = 'Maximum 10 filters';
                addBtn.className = 'bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium cursor-not-allowed';
            } else {
                addBtn.disabled = false;
                addBtn.textContent = '+ Add Filter';
                addBtn.className = 'bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors';
            }
        }

        function applyXmlFilter() {
            const input = document.getElementById('xmlFilterInput').value;
            const elementName = document.getElementById('xmlElementName').value.trim();
            const logicOperator = document.getElementById('xmlLogicOperator').value;
            const output = document.getElementById('xmlFilterOutput');

            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(input, 'text/xml');

                if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
                    throw new Error('Invalid XML');
                }

                // Get elements to filter
                const elements = elementName ?
                    xmlDoc.getElementsByTagName(elementName) :
                    xmlDoc.documentElement.children;

                if (elements.length === 0) {
                    throw new Error(`No elements found with name: ${elementName}`);
                }

                // Collect filter conditions
                const conditions = [];
                for (let i = 1; i <= xmlFilterFieldCount; i++) {
                    const fieldType = document.getElementById(`xmlFieldType-${i}`);
                    const fieldName = document.getElementById(`xmlFieldName-${i}`);
                    const operator = document.getElementById(`xmlOperator-${i}`);
                    const fieldValue = document.getElementById(`xmlFieldValue-${i}`);

                    if (fieldType && fieldName && operator && fieldValue && fieldName.value.trim()) {
                        conditions.push({
                            type: fieldType.value,
                            field: fieldName.value.trim(),
                            operator: operator.value,
                            value: fieldValue.value
                        });
                    }
                }

                if (conditions.length === 0) {
                    // No filters, return all elements
                    const results = Array.from(elements).map(el => el.outerHTML);
                    output.value = results.join('\n\n');
                    return;
                }

                // Apply filters
                const filteredElements = Array.from(elements).filter(element => {
                    const results = conditions.map(condition => {
                        let fieldValue;

                        if (condition.type === 'attribute') {
                            fieldValue = element.getAttribute(condition.field) || '';
                        } else {
                            const childElement = element.getElementsByTagName(condition.field)[0];
                            fieldValue = childElement ? childElement.textContent : '';
                        }

                        return evaluateCondition(fieldValue, condition.operator, condition.value);
                    });

                    return logicOperator === 'AND' ? results.every(r => r) : results.some(r => r);
                });

                if (filteredElements.length === 0) {
                    output.value = 'No matches found';
                } else {
                    const results = filteredElements.map(el => el.outerHTML);
                    output.value = results.join('\n\n');
                }

            } catch (error) {
                output.value = 'Error: ' + error.message;
                output.style.color = "red";
            }
        }

        function downloadXmlFilter() {
            const content = document.getElementById('xmlFilterOutput').value;

            if (!content || content.trim() === '' || content.startsWith('Error:') || content === 'No matches found') {
                alert('Please apply a filter first');
                return;
            }

            try {
                // Wrap results in a root element for valid XML
                const wrappedContent = `<?xml version="1.0" encoding="UTF-8"?>\n<filtered_results>\n${content}\n</filtered_results>`;

                const blob = new Blob([wrappedContent], { type: 'application/xml;charset=utf-8;' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = getDownloadFilename('xml');
                document.body.appendChild(a);
                a.click();

                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);

            } catch (error) {
                alert('Error downloading file: ' + error.message);
            }
        }

        function clearXmlFilter() {
            document.getElementById('xmlFilterInput').value = '';
            document.getElementById('xmlFilterOutput').value = '';
            document.getElementById('xmlElementName').value = 'user';
            document.getElementById('xmlLogicOperator').value = 'AND';

            // Remove all filter fields
            const container = document.getElementById('xmlFilterFields');
            container.innerHTML = '';
            xmlFilterFieldCount = 0;
            updateXmlFilterButton();
        }



        // Search functionality
        function searchTools() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            // Find all menu links
            const navLinks = document.querySelectorAll('nav a, nav button, #beautifierMenu a, #converterMenu a, #filtersMenu a');
            const results = [];
            navLinks.forEach(link => {
                const text = link.textContent.trim();
                const textLower = text.toLowerCase();
                if (searchTerm && textLower.includes(searchTerm)) {
                    // Try to find the section id from the onclick handler
                    const onclick = link.getAttribute('onclick');
                    if (onclick && onclick.includes("showSection")) {
                        const match = onclick.match(/showSection\(['"]([\w-]+)['"]\)/);
                        if (match && match[1]) {
                            results.push({ label: text, section: match[1] });
                        }
                    }
                }
            });
            // Show dropdown
            const dropdown = document.getElementById('searchDropdown');
            if (searchTerm && results.length > 0) {
                dropdown.innerHTML = results.map(r => `<div class='px-4 py-2 cursor-pointer hover:bg-blue-100 text-black' onclick="showSection('${r.section}'); document.getElementById('searchDropdown').classList.add('hidden');">${r.label}</div>`).join('');
                dropdown.classList.remove('hidden');
            } else {
                dropdown.innerHTML = '';
                dropdown.classList.add('hidden');
            }
        }

        // Initialize the page
        document.addEventListener('DOMContentLoaded', function () {
            // Set current time on page load
            setCurrentTime();

            // Populate timezone selects
            populateTimezoneSelects();

            // Add one default timezone converter
            addTimezoneConverter();

            // Setup drag and drop for JSON file upload
            setupDragAndDrop();

            // Setup drag and drop for XML file upload
            setupXmlDragAndDrop();

            // Add default filter fields for both JSON and XML filters
            addJsonFilterField();
            addXmlFilterField();

            initSQLEditor();
            });

        // Drag and Drop for JSON Filter
        function setupJsonFilterDragAndDrop() {
            const dropZone = document.getElementById('jsonFilterDropZone');
            const fileInput = document.getElementById('jsonFilterFileInput');
            dropZone.addEventListener('click', () => fileInput.click());
            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, e => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropZone.classList.add('border-blue-400', 'bg-blue-50');
                });
            });
            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, e => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropZone.classList.remove('border-blue-400', 'bg-blue-50');
                });
            });
            dropZone.addEventListener('drop', e => {
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    fileInput.files = e.dataTransfer.files;
                    handleJsonFilterFileUpload({ target: fileInput });
                }
            });
        }

        // Drag and Drop for XML Filter
        function setupXmlFilterDragAndDrop() {
            const dropZone = document.getElementById('xmlFilterDropZone');
            const fileInput = document.getElementById('xmlFilterFileInput');
            dropZone.addEventListener('click', () => fileInput.click());
            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, e => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropZone.classList.add('border-green-400', 'bg-green-50');
                });
            });
            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, e => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropZone.classList.remove('border-green-400', 'bg-green-50');
                });
            });
            dropZone.addEventListener('drop', e => {
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    fileInput.files = e.dataTransfer.files;
                    handleXmlFilterFileUpload({ target: fileInput });
                }
            });
        }

        // Initialize drag and drop after DOM is loaded
        document.addEventListener('DOMContentLoaded', function () {
            if (document.getElementById('jsonFilterDropZone')) setupJsonFilterDragAndDrop();
            if (document.getElementById('xmlFilterDropZone')) setupXmlFilterDragAndDrop();
        })

        // Toggle dropdowns by ID

        function toggleDropdown(id) {
            // Close all dropdowns first
            document.querySelectorAll('div[id$="Menu"]').forEach(el => {
                if (el.id !== id) el.classList.add('hidden');
            });
            // Open the requested dropdown
            const menu = document.getElementById(id);
            if (menu) {
                menu.classList.toggle('hidden');
            }
        }

        // Close dropdown if clicking outside
        document.addEventListener('click', (event) => {
            const isDropdownButton = event.target.closest('button[onclick^="toggleDropdown"]');
            const isDropdownMenu = event.target.closest('div[id$="Menu"]');
            if (!isDropdownButton && !isDropdownMenu) {
                document.querySelectorAll('div[id$="Menu"]').forEach(el => el.classList.add('hidden'));
            }
        });

        function closeDropdowns() {
        // your code to close dropdowns
            const dropdowns = document.querySelectorAll(".dropdown");
            dropdowns.forEach(d => d.classList.remove("open"));
        }

                tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        'sans': ['Figtree', 'Inter', 'system-ui', 'sans-serif'],
                        'figtree': ['Figtree', 'Inter', 'system-ui', 'sans-serif'],
                    }
                }
            }
        }
        // Handle JSON Filter File Upload
        function handleJsonFilterFileUpload(event) {
            const fileInput = event.target;
            const statusDiv = document.getElementById('jsonFilterUploadStatus');
            const textarea = document.getElementById('jsonFilterInput');
            statusDiv.classList.remove('hidden');
            statusDiv.textContent = 'Reading file...';
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                // Check file size (limit to 1GB)
                if (file.size > 1024 * 1024 * 1024) {
                    statusDiv.textContent = 'File size must be less than 1GB';
                    statusDiv.style.color = 'red'
                    return;
                }
                const reader = new FileReader();
                reader.onload = function (e) {
                    textarea.value = e.target.result;
                    statusDiv.textContent = 'File loaded successfully!';
                    setTimeout(() => { statusDiv.classList.add('hidden'); }, 600000); // hide after 10 minutes
                };
                reader.onerror = function () {
                    statusDiv.textContent = 'Error reading file.';
                };
                reader.readAsText(file);
            } else {
                statusDiv.textContent = 'No file selected.';
            }
        }

        // Handle XML Filter File Upload
        function handleXmlFilterFileUpload(event) {
            const fileInput = event.target;
            const statusDiv = document.getElementById('xmlFilterUploadStatus');
            const textarea = document.getElementById('xmlFilterInput');
            statusDiv.classList.remove('hidden');
            statusDiv.textContent = 'Reading file...';
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                // Check file size (limit to 1GB)
                if (file.size > 1024 * 1024 * 1024) {
                    statusDiv.textContent = 'File size must be less than 1GB';
                    statusDiv.style.color = 'red';
                    return;
                }
                const reader = new FileReader();
                reader.onload = function (e) {
                    textarea.value = e.target.result;
                    statusDiv.textContent = 'File loaded successfully!';
                    setTimeout(() => { statusDiv.classList.add('hidden'); }, 600000); // hide after 10 minutes
                };
                reader.onerror = function () {
                    statusDiv.textContent = 'Error reading file.';
                };
                reader.readAsText(file);
            } else {
                statusDiv.textContent = 'No file selected.';
            }
        }
        ;
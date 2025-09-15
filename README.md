## tsetools: 

## Version History:
v1.0 (main branch): Original 
v1.1 (v1-1 branch): backup of Original 
v1.2 (v1-2 branch): Add SQL Formatter

Desktop-View Only

🔧 All-in-One Tool to Boost Your Work:
- Formatters: XML, JSON, HTML
- Timezone Converter
- JSON/XML ⇆ CSV Converter
- XML/JSON Data Filter

🖥️ Self-Hosted on Your Local Machine:
- No need for multiple online tools
- Zero data-leak risk
- Quick setup, instant rerun
    
## Requirements

- Python 3.7+
- VSCode or any IDE
- See `requirements.txt` for Python packages

## FIRST STEP
Open VSCode Terminal (recommended) and cd to your project folder

## Installation: run below commands

### macOS/Linux (bash/zsh)
1. **Clone the repository:** (first time only)
   
   git clone https://github.com/tkytkqc6t/tsetools.git
   
   cd tsetools
   

2. **Create a virtual environment (recommended):**
   
   python3 -m venv venv
   
   source venv/bin/activate
   

3. **Install dependencies:**
   
   pip3 install -r requirements.txt
   

4. **Run the server:**
   
   python3 server.py
   
Then open your browser and go to http://127.0.0.1:5000 as directed in the command lines

### Windows (PowerShell)
1. **Clone the repository:** (first time only)
   powershell
   
   git clone https://github.com/tkytkqc6t/tsetools.git
   
   cd tsetools
   

2. **Create a virtual environment (recommended):**
   powershell
   
   python -m venv venv
   
   .\venv\Scripts\Activate.ps1
   

3. **Install dependencies:**
   powershell
   
   pip install -r requirements.txt
   

4. **Run the server:**
   powershell
   
   python server.py
   
Then open your browser and go to http://127.0.0.1:5000 as directed in the command lines

## Project Structure

- `server.py`: Main server script
- `templates/`: HTML templates
- `static/`: Static files (JS, CSS)
- `uploads/`: Uploaded files




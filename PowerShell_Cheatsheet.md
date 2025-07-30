# PowerShell Cheatsheet for Windows 11 Users

## 📁 File & Folder Navigation

### View Current Location
```powershell
pwd                    # Print Working Directory (where you are)
Get-Location           # Same as pwd
```

### List Files and Folders
```powershell
ls                     # List files and folders
dir                    # Same as ls
Get-ChildItem          # Full command name
ls -la                 # List all files with details
ls *.txt               # List only .txt files
```

### Change Directory
```powershell
cd Desktop             # Go to Desktop folder
cd ..                  # Go up one level
cd \                   # Go to root of drive
cd ~                   # Go to user home folder
cd "C:\Program Files"  # Use quotes for paths with spaces
```

## 📂 Creating Files & Folders

### Create New Folder
```powershell
mkdir MyFolder         # Make new folder
New-Item -ItemType Directory -Name "MyFolder"  # Full command
md MyFolder           # Short version
```

### Create New File
```powershell
New-Item file.txt      # Create empty file
echo "Hello" > file.txt # Create file with content
notepad file.txt       # Create and open in Notepad
```

## ✂️ Copy, Cut & Paste Operations

### Copy Files
```powershell
cp file.txt file2.txt  # Copy file to new name
Copy-Item file.txt C:\Destination\  # Copy to different location
cp *.txt C:\Backup\    # Copy all .txt files
cp -r Folder1 Folder2  # Copy folder and all contents
```

### Move (Cut) Files
```powershell
mv file.txt C:\NewLocation\  # Move file
Move-Item file.txt newname.txt  # Move and rename
mv *.jpg Pictures\     # Move all jpg files
```

### Delete Files
```powershell
rm file.txt            # Remove file
Remove-Item file.txt   # Full command
del file.txt          # Alternative
rm -r FolderName      # Remove folder and contents
rm *.tmp              # Remove all .tmp files
```

## 📝 View & Edit File Contents

### View File Contents
```powershell
cat file.txt          # Display file contents
Get-Content file.txt  # Full command
type file.txt         # Alternative
more file.txt         # Page through long files
```

### Edit Files
```powershell
notepad file.txt      # Open in Notepad
code file.txt         # Open in VS Code (if installed)
start file.txt        # Open with default program
```

## 🔍 Search Operations

### Find Files
```powershell
Get-ChildItem -Recurse -Filter "*.txt"  # Find all .txt files
ls -r *.pdf           # Find all PDFs recursively
where.exe python      # Find where python is installed
```

### Search Inside Files
```powershell
Select-String "search term" file.txt     # Search in specific file
Select-String "search term" *.txt        # Search in all .txt files
findstr "search term" file.txt           # Alternative search
```

## 📊 File Information

### Get File/Folder Properties
```powershell
Get-Item file.txt     # Basic info
ls -l file.txt        # Detailed info
Get-ItemProperty file.txt  # All properties
```

### Check File Size
```powershell
(Get-Item file.txt).Length  # Size in bytes
ls file.txt | Select-Object Name, Length  # Name and size
```

## 🖥️ System Operations

### Open File Explorer
```powershell
explorer .            # Open current folder
explorer C:\          # Open C: drive
ii .                  # Short for Invoke-Item
```

### Run Programs
```powershell
calc                  # Calculator
mspaint              # Paint
notepad              # Notepad
explorer             # File Explorer
taskmgr              # Task Manager
```

## 🔄 Common Tasks

### Rename Files/Folders
```powershell
Rename-Item oldname.txt newname.txt
ren oldname.txt newname.txt  # Short version
mv oldname.txt newname.txt   # Alternative
```

### Check if File Exists
```powershell
Test-Path file.txt    # Returns True or False
if (Test-Path file.txt) { echo "File exists!" }
```

### Get Current Date/Time
```powershell
Get-Date              # Current date and time
Get-Date -Format "yyyy-MM-dd"  # Formatted date
```

### Clear Screen
```powershell
cls                   # Clear screen
Clear-Host            # Full command
```

## 🚀 Helpful Tips

### Tab Completion
- Start typing a command or path and press `Tab` to auto-complete
- Press `Tab` multiple times to cycle through options

### Command History
```powershell
history               # Show command history
h                     # Short version
↑ / ↓ arrows         # Navigate through previous commands
Ctrl+R               # Search command history
```

### Get Help
```powershell
Get-Help command      # Get help for any command
command -?            # Quick help
Get-Command *copy*    # Find commands containing "copy"
```

### Aliases (Shortcuts)
```powershell
Get-Alias            # See all command shortcuts
Get-Alias ls         # See what 'ls' stands for
```

## 💡 PowerShell vs Command Prompt

PowerShell accepts most CMD commands:
- `dir` → works in both
- `cd` → works in both
- `mkdir` → works in both
- `del` → works in both

But PowerShell is more powerful:
- Object-oriented output
- Better scripting capabilities
- More consistent command structure
- Pipeline operations with `|`

## 🎯 Quick Reference

| Task | PowerShell Command |
|------|-------------------|
| Where am I? | `pwd` |
| List files | `ls` or `dir` |
| Change folder | `cd FolderName` |
| Go back | `cd ..` |
| Make folder | `mkdir NewFolder` |
| Copy file | `cp source.txt dest.txt` |
| Move file | `mv file.txt C:\NewLocation\` |
| Delete file | `rm file.txt` |
| View file | `cat file.txt` |
| Edit file | `notepad file.txt` |
| Find files | `ls -r *.txt` |
| Clear screen | `cls` |

## 📌 Pro Tips

1. **Use Tab**: Press Tab to autocomplete paths and commands
2. **Use Quotes**: For paths with spaces: `cd "Program Files"`
3. **Use Wildcards**: `*` matches anything: `rm *.tmp`
4. **Check First**: Use `ls` before `rm` to see what you'll delete
5. **Get Help**: Use `Get-Help command` for any command

Remember: PowerShell is case-insensitive, so `LS`, `ls`, and `Ls` all work the same!
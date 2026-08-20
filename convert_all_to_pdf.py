import os
import re
import subprocess
import sys

# Directory containing markdown files
USER_GUIDES_DIR = r"c:\Users\admin\Downloads\caseManagement code\user_guides"
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

def simple_md_to_html(md_text):
    """
    Converts Markdown text to clean HTML with styling.
    """
    lines = md_text.split('\n')
    html_lines = []
    in_code_block = False
    in_table = False
    table_headers = []
    
    css_style = """
    <style>
        @page {
            size: A4;
            margin: 20mm 15mm 20mm 15mm;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1e293b;
            line-height: 1.6;
            margin: 0;
            padding: 20px 30px;
            background-color: #ffffff;
        }
        h1 {
            color: #0f172a;
            font-size: 24px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 8px;
            margin-top: 20px;
            margin-bottom: 15px;
        }
        h2 {
            color: #1e3a8a;
            font-size: 19px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 5px;
            margin-top: 22px;
            margin-bottom: 12px;
        }
        h3 {
            color: #2563eb;
            font-size: 15px;
            margin-top: 16px;
            margin-bottom: 8px;
        }
        p {
            margin-top: 6px;
            margin-bottom: 10px;
            font-size: 13px;
        }
        ul, ol {
            margin-top: 6px;
            margin-bottom: 10px;
            padding-left: 24px;
            font-size: 13px;
        }
        li {
            margin-bottom: 4px;
        }
        blockquote {
            background-color: #f1f5f9;
            border-left: 4px solid #2563eb;
            margin: 12px 0;
            padding: 10px 16px;
            font-style: italic;
            font-size: 13px;
        }
        code {
            font-family: 'Consolas', 'Courier New', monospace;
            background-color: #f1f5f9;
            color: #0f172a;
            padding: 2px 5px;
            border-radius: 4px;
            font-size: 12px;
        }
        pre {
            background-color: #0f172a;
            color: #f8fafc;
            padding: 14px;
            border-radius: 6px;
            overflow-x: auto;
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.4;
            margin: 12px 0;
        }
        pre code {
            background-color: transparent;
            color: inherit;
            padding: 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 12px;
        }
        th {
            background-color: #1e293b;
            color: #ffffff;
            font-weight: 600;
            text-align: left;
            padding: 8px 12px;
            border: 1px solid #334155;
        }
        td {
            padding: 8px 12px;
            border: 1px solid #cbd5e1;
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        hr {
            border: none;
            border-top: 1px solid #e2e8f0;
            margin: 20px 0;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            font-size: 11px;
            font-weight: 600;
            border-radius: 4px;
            background-color: #e0f2fe;
            color: #0369a1;
        }
    </style>
    """

    html_lines.append("<!DOCTYPE html><html><head><meta charset='utf-8'>" + css_style + "</head><body>")

    for line in lines:
        stripped = line.strip()

        # Code block handling
        if stripped.startswith("```"):
            if in_code_block:
                html_lines.append("</code></pre>")
                in_code_block = False
            else:
                html_lines.append("<pre><code>")
                in_code_block = True
            continue

        if in_code_block:
            # Escape HTML characters inside code blocks
            safe_code = line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            html_lines.append(safe_code)
            continue

        # Table handling
        if stripped.startswith("|") and stripped.endswith("|"):
            cells = [c.strip() for c in stripped.split("|")[1:-1]]
            
            # Check if separator row like |---|---|
            if all(re.match(r"^:?-+:?$", c) for c in cells):
                continue
                
            if not in_table:
                in_table = True
                html_lines.append("<table><thead><tr>")
                for cell in cells:
                    html_lines.append(f"<th>{cell}</th>")
                html_lines.append("</tr></thead><tbody>")
            else:
                html_lines.append("<tr>")
                for cell in cells:
                    # Parse bold/code in cells
                    cell_html = parse_inline_styles(cell)
                    html_lines.append(f"<td>{cell_html}</td>")
                html_lines.append("</tr>")
            continue
        else:
            if in_table:
                html_lines.append("</tbody></table>")
                in_table = False

        if not stripped:
            continue

        # Headings
        if stripped.startswith("# "):
            html_lines.append(f"1".replace("1", f"<h1>{parse_inline_styles(stripped[2:])}</h1>"))
        elif stripped.startswith("## "):
            html_lines.append(f"<h2>{parse_inline_styles(stripped[3:])}</h2>")
        elif stripped.startswith("### "):
            html_lines.append(f"<h3>{parse_inline_styles(stripped[4:])}</h3>")
        elif stripped.startswith("#### "):
            html_lines.append(f"<h4>{parse_inline_styles(stripped[5:])}</h4>")
        elif stripped.startswith("---") or stripped.startswith("***"):
            html_lines.append("<hr>")
        elif stripped.startswith("> "):
            html_lines.append(f"<blockquote>{parse_inline_styles(stripped[2:])}</blockquote>")
        elif stripped.startswith("* ") or stripped.startswith("- "):
            html_lines.append(f"<ul><li>{parse_inline_styles(stripped[2:])}</li></ul>")
        elif re.match(r"^\d+\.\s", stripped):
            content = re.sub(r"^\d+\.\s", "", stripped)
            html_lines.append(f"<ol><li>{parse_inline_styles(content)}</li></ol>")
        else:
            html_lines.append(f"<p>{parse_inline_styles(stripped)}</p>")

    if in_table:
        html_lines.append("</tbody></table>")

    html_lines.append("</body></html>")
    return "\n".join(html_lines)

def parse_inline_styles(text):
    # Escape special chars except those needed
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    # Bold **text**
    text = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", text)
    # Italic *text*
    text = re.sub(r"\*(.*?)\*", r"<em>\1</em>", text)
    # Inline code `text`
    text = re.sub(r"`(.*?)`", r"<code>\1</code>", text)
    return text

def convert_md_files():
    md_files = [f for f in os.listdir(USER_GUIDES_DIR) if f.endswith(".md")]
    print(f"Found {len(md_files)} markdown files in {USER_GUIDES_DIR}")

    for md_file in md_files:
        md_path = os.path.join(USER_GUIDES_DIR, md_file)
        html_path = os.path.join(USER_GUIDES_DIR, md_file.replace(".md", ".html"))
        pdf_path = os.path.join(USER_GUIDES_DIR, md_file.replace(".md", ".pdf"))

        print(f"\nProcessing {md_file}...")
        
        with open(md_path, "r", encoding="utf-8") as f:
            md_content = f.read()

        html_content = simple_md_to_html(md_content)
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        print(f"  Generated HTML: {html_path}")

        # Run Edge headless to convert HTML to PDF
        cmd = [
            EDGE_PATH,
            "--headless",
            "--disable-gpu",
            "--no-pdf-header-footer",
            f"--print-to-pdf={pdf_path}",
            html_path
        ]

        try:
            res = subprocess.run(cmd, capture_output=True, text=True, check=True)
            print(f"  Successfully created PDF: {pdf_path}")
        except Exception as e:
            print(f"  Error creating PDF for {md_file}: {e}")

if __name__ == "__main__":
    convert_md_files()

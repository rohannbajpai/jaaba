// latexTemplate.ts

/**
 * We define a standard interface for each "Block" the user creates:
 * - sectionName: e.g. "Header", "Education", "Experience", "Technical Skills", "Projects"
 * - title: e.g. "University of Maryland" or "Software Engineer Intern"
 * - location: e.g. "College Park, MD"
 * - duration: e.g. "Aug 2021 -- Dec 2024"
 * - description: multiline string of bullet items (one bullet per line)
 */
export interface Block {
    id: string
    sectionName: string
    title: string
    location?: string
    duration?: string
    description?: string
  }
  
  /**
   * This is our modified Jake Gutierrez preamble that produces
   * the style from your second screenshot:
   * - Big name + contact at top center
   * - \section lines with a horizontal rule
   * - Bold on the left, italics/dates on the right
   * - Dashes for bullet points
   */
  export const defaultLatexPreamble = String.raw`
  \documentclass[letterpaper,11pt]{article}
  
  %--------------------------------------------------
  % Packages & Basic Setup
  %--------------------------------------------------
  \usepackage{latexsym}
  \usepackage[empty]{fullpage}
  \usepackage{titlesec}
  \usepackage{marvosym}    % For symbols like \Mobilefone
  \usepackage[usenames,dvipsnames]{color}
  \usepackage{verbatim}
  \usepackage{enumitem}
  \usepackage[hidelinks]{hyperref}
  \usepackage{fancyhdr}
  \usepackage[english]{babel}
  \usepackage{tabularx}
  \input{glyphtounicode}
  
  % Page style tweaks
  \pagestyle{fancy}
  \fancyhf{}
  \renewcommand{\headrulewidth}{0pt}
  \renewcommand{\footrulewidth}{0pt}
  \urlstyle{same}
  \raggedbottom
  \raggedright
  \setlength{\tabcolsep}{0in}
  
  % Make section titles a bit bigger and draw a thin rule
  \titleformat{\section}{
    \vspace{-3pt}\scshape\Large
  }{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]
  
  % Slightly smaller subsection
  \titleformat{\subsection}{
    \vspace{-3pt}\scshape\large
  }{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]
  
  % So copy/pasted text remains machine-readable
  \pdfgentounicode=1
  
  % For tighter item spacing
  \setlist[itemize]{leftmargin=*, label={-}}
  \setlength\parindent{0pt}
  
  \begin{document}
  `
  
  /**
   * We'll end the document at the bottom.
   */
  export const defaultLatexPostamble = String.raw`
  \end{document}
  `
  
  /**
   * Helper function to escape LaTeX special characters.
   * This ensures user text won't break the LaTeX compile.
   */
  function escapeLatex(str: string): string {
    return str
      // Backslash first!
      .replace(/\\/g, '\\textbackslash{}')
      // Then special chars
      .replace(/%/g, '\\%')
      .replace(/\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/{/g, '\\{')
      .replace(/}/g, '\\}')
      .replace(/\^/g, '\\^{}')
      .replace(/~/g, '\\~{}')
      .replace(/&/g, '\\&')
  }
  
  /**
   * Generates a .tex document that:
   *
   * 1) Looks for a "Header" block to place Name + Contact Info at the top (centered).
   * 2) For all other blocks, groups them by sectionName ("Education", "Experience", etc.).
   * 3) Renders them in the style from your second screenshot:
   *    \section{SECTION NAME}
   *
   *    \textbf{Title} \hfill \textit{Duration}\\
   *    \textit{Location}\\
   *    - bullet #1
   *    - bullet #2
   *    etc.
   *
   * 4) Produces a final LaTeX string that Overleaf can compile with no extra macros needed.
   */

  export function wrapJakeTemplate(blocks: Block[]): string {
    let doc = `
      \\documentclass[10pt]{article}
      \\usepackage[utf8]{inputenc}
      \\usepackage{hyperref}
      \\usepackage{xcolor}
      \\hypersetup{
        colorlinks=true,
        linkcolor=blue,
        urlcolor=blue,
        filecolor=blue,
        citecolor=blue
      }
      \\usepackage{geometry}
      \\geometry{margin=0.5in}
      \\begin{document}
    `;
  
    // -- 1) Process the "Header" block
    const headerBlock = blocks.find((b) => b.sectionName.toLowerCase() === 'header');
    if (headerBlock) {
      const name = headerBlock.title ? escapeLatex(headerBlock.title) : 'Your Name';
      const phone = headerBlock.phone ? escapeLatex(headerBlock.phone) : 'Your Phone';
      const email = headerBlock.email
        ? `\\href{mailto:${escapeLatex(headerBlock.email)}}{${escapeLatex(headerBlock.email)}}`
        : 'Your Email';
      const github = headerBlock.github
        ? `\\href{${escapeLatex(headerBlock.github)}}{${escapeLatex(headerBlock.github)}}`
        : '';
      const linkedin = headerBlock.linkedin
        ? `\\href{${escapeLatex(headerBlock.linkedin)}}{${escapeLatex(headerBlock.linkedin)}}`
        : '';
  
      // Combine all contact details into a single line
      const contactLine = [phone, email, github, linkedin].filter(Boolean).join(' \\textbar{} ');
  
      doc += String.raw`
  \begin{center}
      {\Huge \scshape ${name}}\\[4pt]
      ${contactLine}
  \end{center}
  \vspace{-12pt}
  `;
    }
  
    // -- 2) Process non-header blocks
    const nonHeaderBlocks = blocks.filter((b) => b.sectionName.toLowerCase() !== 'header');
  
    const sectionMap = new Map<string, Block[]>();
    for (const block of nonHeaderBlocks) {
      const section = block.sectionName || 'Misc';
      if (!sectionMap.has(section)) {
        sectionMap.set(section, []);
      }
      sectionMap.get(section)!.push(block);
    }
  
    // -- 3) Render each section
    for (const [sectionName, sectionBlocks] of sectionMap.entries()) {
      doc += `\\section{${escapeLatex(sectionName)}}\n\n`;
  
      for (const block of sectionBlocks) {
        const title = block.title ? escapeLatex(block.title) : '';
        const location = block.location ? escapeLatex(block.location) : '';
        const duration = block.duration ? escapeLatex(block.duration) : '';
  
        doc += String.raw`
  \textbf{${title}} \hfill \textit{${duration}}\\
  \textit{${location}} \\[2pt]
  `;
  
        if (block.description) {
          const lines = block.description.split('\n').map((l) => l.trim()).filter(Boolean);
          for (const line of lines) {
            doc += `- ${escapeLatex(line)} \\\\\n`;
          }
        }
  
        doc += '\n';
      }
    }
  
    // -- 4) Finish the document
    doc += "\\end{document}";
    return doc;
  }
  
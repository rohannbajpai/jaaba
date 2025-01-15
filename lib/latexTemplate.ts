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
    let doc = defaultLatexPreamble + '\n\n'
  
    // -- 1) If there's a "Header" block, we'll build a centered heading.
    //    If the user has multiple headers, we can combine them or just take the first.
    const headerBlock = blocks.find((b) => b.sectionName.toLowerCase() === 'header')
    if (headerBlock) {
      // We'll interpret:
      //   title => user's name
      //   location => phone/email (or additional contact)
      //   duration => LinkedIn/GitHub
      //   description => any lines we want to display below
      const name = headerBlock.title ? escapeLatex(headerBlock.title) : 'Your Name'
      const contactLine = headerBlock.location ? escapeLatex(headerBlock.location) : 'Phone/Email'
      const linkLine = headerBlock.duration ? escapeLatex(headerBlock.duration) : 'LinkedIn/GitHub'
  
      // If there's a multiline description, we can bullet it or just show it inline
      let extraLines = ''
      if (headerBlock.description) {
        const lines = headerBlock.description.split('\n').map((l) => l.trim()).filter(Boolean)
        // Just join them with " | " or newlines
        extraLines = lines.join(' \\ ')
      }
  
      doc += String.raw`
  \begin{center}
      {\Huge \scshape ${name}}\\[2pt]
      ${contactLine} \ $|$ \ ${linkLine} \\
      ${extraLines}
  \end{center}
  \vspace{-6pt}
  `
    }
  
    // -- 2) Group the rest of the blocks by their sectionName
    // ignoring "Header" or "header" since we already processed it
    const nonHeaderBlocks = blocks.filter((b) => b.sectionName.toLowerCase() !== 'header')
  
    // We'll keep them in the order they appear, but group by sectionName
    const sectionMap = new Map<string, Block[]>()
    for (const block of nonHeaderBlocks) {
      const section = block.sectionName || 'Misc'
      if (!sectionMap.has(section)) {
        sectionMap.set(section, [])
      }
      sectionMap.get(section)!.push(block)
    }
  
    // -- 3) For each section group, make a \section, then list each block
    for (const [sectionName, sectionBlocks] of sectionMap.entries()) {
      doc += `\\section{${escapeLatex(sectionName)}}\n\n`
  
      // For each block, we produce:
      // \textbf{Title} \hfill \textit{Duration}\\
      // \textit{Location}\\
      // - bullet1
      // - bullet2
      // (with a bit of spacing)
      for (const block of sectionBlocks) {
        const title = block.title ? escapeLatex(block.title) : ''
        const location = block.location ? escapeLatex(block.location) : ''
        const duration = block.duration ? escapeLatex(block.duration) : ''
  
        doc += String.raw`
  \textbf{${title}} \hfill \textit{${duration}}\\
  \textit{${location}} \\[2pt]
  `
  
        // Now bullet each line in description
        if (block.description) {
          const lines = block.description.split('\n').map((l) => l.trim()).filter(Boolean)
          for (const line of lines) {
            doc += `- ${escapeLatex(line)} \\\\\n`
          }
        }
  
        // Add some vertical space after each block
        doc += '\n'
      }
    }
  
    // -- 4) Finish the doc
    doc += defaultLatexPostamble
    return doc
  }
  
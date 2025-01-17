// ----------------------------
// latexTemplate.ts
// ----------------------------

/**
 * The "Block" interface for each résumé section.
 * Must match the shape from EditableBlockData,
 * but we only need the fields we actually use in LaTeX.
 */
export interface Block {
  id: string;
  sectionName: string;

  /* Common fields */
  location?: string;
  duration?: string;

  /* Header-specific */
  fullName?: string;
  phone?: string;
  email?: string;
  github?: string;
  linkedin?: string;

  /* Education-specific */
  institutionName?: string;
  degree?: string;
  relevantCourses?: string;
  activities?: string;

  /* Experience-specific */
  companyName?: string;
  role?: string;
  bullets?: string[];

  /* Projects-specific */
  projectName?: string;
  technologies?: string;
  projectBullets?: string[];

  /* Skills-specific */
  languages?: string;
  other?: string;
}
  
  /**
   * Jake Gutierrez–style LaTeX preamble
   */
  export const defaultLatexPreamble = String.raw`
  \documentclass[letterpaper,11pt]{article}
  \usepackage{enumitem}

  
  \usepackage{latexsym}
  \usepackage[empty]{fullpage}
  \usepackage{titlesec}
  \usepackage{marvosym}
  \usepackage[usenames,dvipsnames]{color}
  \usepackage{verbatim}
  \usepackage{enumitem}
  \usepackage[hidelinks]{hyperref}
  \usepackage{fancyhdr}
  \usepackage[english]{babel}
  \usepackage{tabularx}
  \input{glyphtounicode}
  
  \pagestyle{fancy}
  \fancyhf{}
  \fancyfoot{}
  \renewcommand{\headrulewidth}{0pt}
  \renewcommand{\footrulewidth}{0pt}
  
  % Adjust margins
  \addtolength{\oddsidemargin}{-0.5in}
  \addtolength{\evensidemargin}{-0.5in}
  \addtolength{\textwidth}{1in}
  \addtolength{\topmargin}{-.6in}
  \addtolength{\textheight}{1.0in}
  
  \urlstyle{same}
  \raggedbottom
  \raggedright
  \setlength{\tabcolsep}{0in}
  
  % Large section titles with a thin rule
  \titleformat{\section}{
    \vspace{-4pt}\scshape\raggedright\large
  }{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]
  
  % Keep text machine-readable
  \pdfgentounicode=1
  
  % Resume item commands
  \newcommand{\resumeItem}[1]{
    \item\small{
      {#1 \vspace{-2pt}}
    }
  }
  
  \newcommand{\resumeSubheading}[4]{
    \vspace{-2pt}\item
      \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
        \textbf{#1} & #2 \\
        \textit{\small#3} & \textit{\small #4} \\
      \end{tabular*}\vspace{-7pt}
  }
  
  \newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
  \newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
  \newcommand{\resumeItemListStart}{\begin{itemize}}
  \newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}
  
  \begin{document}
  `
  
  export const defaultLatexPostamble = String.raw`
  \end{document}
  `
  
  
  /** Minimal function to escape LaTeX special characters. */
  function escapeLatex(str: string | undefined): string {
    if (!str) return ""
    return str
      .replace(/\\/g, "\\textbackslash{}")
      .replace(/%/g, "\\%")
      .replace(/\$/g, "\\$")
      .replace(/#/g, "\\#")
      .replace(/_/g, "\\_")
      .replace(/{/g, "\\{")
      .replace(/}/g, "\\}")
      .replace(/\^/g, "\\^{}")
      .replace(/~/g, "\\~{}")
      .replace(/&/g, "\\&")
  }
  
  /**
   * Convert an array of "Block" data into a .tex string.
   */
  export function wrapJakeTemplate(blocks: Block[]): string {
    let doc = defaultLatexPreamble
  
    // Filter out invalid blocks first
    const validBlocks = blocks.filter(b => b && b.sectionName);
  
    // 1) Handle the "Header" block (if any):
    const header = validBlocks.find((b) => b.sectionName.toLowerCase() === "header")
    if (header) {
      doc += `
\\begin{center}
  \\textbf{\\Huge \\scshape ${escapeLatex(header.fullName)}} \\\\ \\vspace{1pt}
  \\small ${escapeLatex(header.phone)} $|$ 
  \\href{mailto:${escapeLatex(header.email)}}{\\underline{${escapeLatex(header.email)}}} $|$
  \\href{${escapeLatex(header.linkedin)}}{\\underline{${escapeLatex(header.linkedin)}}} $|$
  \\href{${escapeLatex(header.github)}}{\\underline{${escapeLatex(header.github)}}}
\\end{center}

`
    }
  
    // 2) Group the rest by sectionName (excluding header).
    const groups = new Map<string, Block[]>()
    validBlocks
      .filter((b) => b.sectionName.toLowerCase() !== "header")
      .forEach((blk) => {
        const key = blk.sectionName
        if (!groups.has(key)) {
          groups.set(key, [])
        }
        groups.get(key)!.push(blk)
      })
  
    // 3) Render each section.
    for (const [sectionName, sectionBlocks] of groups) {
      const sectionKey = sectionName.toLowerCase()
      doc += `\\section{${escapeLatex(sectionName)}}\n`
      doc += `\\resumeSubHeadingListStart\n`
  
      for (const block of sectionBlocks) {
        switch (sectionKey) {
          // EDUCATION
          case "education":
            doc += String.raw`
              \resumeSubheading
              {${escapeLatex(block.institutionName)}}{${escapeLatex(block.location)}}
              {${escapeLatex(block.degree)}}{${escapeLatex(block.duration)}}
              \begin{itemize}[leftmargin=0in, label={}]
                \small{
                  ${block.relevantCourses ? `\\item \\textbf{Relevant Courses}: ${escapeLatex(block.relevantCourses)} \\\\` : ''}
                  ${block.activities ? `\\item \\textbf{Activities}: ${escapeLatex(block.activities)}` : ''}
                }\vspace*{-6pt}
              \end{itemize}
              `
            break
  
          // TECHNICAL SKILLS
          case "technical skills":
            doc += String.raw`
            \begin{itemize}[leftmargin=0in, label={}]
              \small{
                ${block.languages ? `\\item \\textbf{Languages}: ${escapeLatex(block.languages)} \\\\` : ''}
                ${block.other ? `\\item \\textbf{Other}: ${escapeLatex(block.other)}` : ''}
              }
            \end{itemize}
            `
            break
  
          // EXPERIENCE
          case "experience": {
            const safeCompany = escapeLatex(block.companyName)
            const safeLocation = escapeLatex(block.location)
            const safeDuration = escapeLatex(block.duration)
            const safeRole = escapeLatex(block.role || "")
            doc += String.raw`
\resumeSubheading
{${safeCompany}}{${safeDuration}}
{${safeRole}}{${safeLocation}}
\resumeItemListStart
`
            if (block.bullets) {
              for (const bullet of block.bullets) {
                doc += `  \\resumeItem{${escapeLatex(bullet)}}\n`
              }
            }
            doc += "\\resumeItemListEnd\n\n"
            break
          }
  
          // PROJECTS
          case "projects": {
            const safeProjectName = escapeLatex(block.projectName)
            const safeTechnologies = escapeLatex(block.technologies)
            const safeDuration = escapeLatex(block.duration)
            doc += String.raw`
\resumeSubheading
{${safeProjectName}}{${safeDuration}}
{${safeTechnologies}}{${escapeLatex(block.location)}}
\resumeItemListStart
`
            if (block.projectBullets) {
              for (const bullet of block.projectBullets) {
                doc += `  \\resumeItem{${escapeLatex(bullet)}}\n`
              }
            }
            doc += "\\resumeItemListEnd\n\n"
            break
          }
  
          default:
            // Catch-all - use companyName as generic title
            doc += String.raw`
\resumeSubheading
{${escapeLatex(block.companyName)}}{${escapeLatex(block.duration)}}
{}{${escapeLatex(block.location)}}
\resumeItemListStart
  \resumeItem{(No special fields for this section.)}
\resumeItemListEnd

`
            break
        }
      }
      doc += "\\resumeSubHeadingListEnd\n"
    }
  
    // 4) Finish
    doc += defaultLatexPostamble
    return doc
  }
  
// latexTemplate.ts

/**
 * We define a standard interface for each "Block" the user creates:
 * - sectionName: e.g. "Header", "Education", "Experience", "Technical Skills", "Projects"
 * - title: e.g. "University of Maryland" or "Software Engineer Intern"
 * - location: e.g. "College Park, MD"
 * - duration: e.g. "Aug 2021 -- Dec 2024"
 * - description: multiline string of bullet items (one bullet per line)
 */
// latexTemplate.ts

export interface Block {
  id: string;
  sectionName: string;
  title: string;
  location?: string;
  duration?: string;
  // Header specific
  phone?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  // Education specific
  degree?: string;
  relevantCourses?: string;
  activities?: string;
  // Skills specific
  languages?: string;
  other?: string;
  // Experience and Projects
  bullets?: string[];
  technologies?: string;
}

export const defaultLatexPreamble = String.raw`
\documentclass[letterpaper,11pt]{article}

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

\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.6in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

\pdfgentounicode=1

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
`;

export const defaultLatexPostamble = String.raw`
\end{document}
`;

function escapeLatex(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/\^/g, '\\^{}')
    .replace(/~/g, '\\~{}')
    .replace(/&/g, '\\&');
}

export function wrapJakeTemplate(blocks: Block[]): string {
  let doc = defaultLatexPreamble;

  // Process Header block
  const headerBlock = blocks.find((b) => b.sectionName.toLowerCase() === 'header');
  if (headerBlock) {
    doc += `
\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(headerBlock.title)}} \\\\ \\vspace{1pt}
    \\small ${escapeLatex(headerBlock.phone)} $|$ 
    \\href{mailto:${escapeLatex(headerBlock.email || '')}}{\\underline{${escapeLatex(headerBlock.email || '')}}} $|$ 
    \\href{${escapeLatex(headerBlock.linkedin || '')}}{\\underline{${escapeLatex(headerBlock.linkedin || '')}}} $|$
    \\href{${escapeLatex(headerBlock.github || '')}}{\\underline{${escapeLatex(headerBlock.github || '')}}}\n
\\end{center}
`;
  }

  // Group blocks by section
  const sections = new Map<string, Block[]>();
  blocks
    .filter(b => b.sectionName.toLowerCase() !== 'header')
    .forEach(block => {
      if (!sections.has(block.sectionName)) {
        sections.set(block.sectionName, []);
      }
      sections.get(block.sectionName)!.push(block);
    });

  // Process each section
  for (const [sectionName, sectionBlocks] of sections) {
    doc += `\\section{${escapeLatex(sectionName)}}\n`;
    doc += `\\resumeSubHeadingListStart\n`;

    for (const block of sectionBlocks) {
      switch (sectionName.toLowerCase()) {
        case 'education':
          doc += `  \\resumeSubheading
    {${escapeLatex(block.title)}}{${escapeLatex(block.location || '')}}
    {${escapeLatex(block.degree || '')}}{${escapeLatex(block.duration || '')}}
    \\begin{itemize}[leftmargin=0in, label={}]
        \\small{\\item{
        \\textbf{{Relevant Courses}}{: ${escapeLatex(block.relevantCourses || '')}}
        
        \\small\\textbf{{Activities}}{: ${escapeLatex(block.activities || '')}}
        }}\\vspace*{-6pt}
    \\end{itemize}\n`;
          break;

        case 'technical skills':
          doc += `\\begin{itemize}[leftmargin=0in, label={}]
    \\small{\\item{
     \\textbf{Languages}{: ${escapeLatex(block.languages || '')}} \\\\
     \\textbf{Other}{: ${escapeLatex(block.other || '')}} \\\\
    }}
\\end{itemize}\n`;
          break;

        case 'experience':
        case 'projects':
          const roleOrTech = block.sectionName.toLowerCase() === 'projects' 
            ? block.technologies || ''
            : block.title;
            
          doc += `  \\resumeSubheading
    {${escapeLatex(block.title)}}{${escapeLatex(block.duration || '')}}
    {${roleOrTech}}{${escapeLatex(block.location || '')}}
    \\resumeItemListStart\n`;

          if (block.bullets) {
            block.bullets.forEach(bullet => {
              doc += `      \\resumeItem{${escapeLatex(bullet)}}\n`;
            });
          }

          doc += `    \\resumeItemListEnd\n\n`;
          break;
      }
    }

    doc += `\\resumeSubHeadingListEnd\n\n`;
  }

  doc += defaultLatexPostamble;
  return doc;
}
// Our base preamble (Jake Gutierrez resume).
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
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

\pdfgentounicode=1

% Custom commands from the Jake G. template:

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeSubheading}[4]{
  \item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-5pt}
}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}}

\begin{document}
`

export const defaultLatexPostamble = String.raw`
\end{document}
`

type Block = {
  id: string
  sectionName: string
  title: string
  location?: string
  duration?: string
  description?: string
}

/**
 * Convert the user’s blocks into a valid .tex document:
 * 1) Insert special "header" block if present
 * 2) Group others by sectionName for \section
 * 3) Use Jake G. commands to create headings & bullet items
 */
export function wrapJakeTemplate(blocks: Block[]): string {
  let doc = defaultLatexPreamble + "\n\n"

  // 1) Look for "Header" blocks & insert them in the top center
  //    If user has multiple "Header" blocks, we combine them (rare but possible).
  const headerBlocks = blocks.filter((b) => b.sectionName === "Header")
  if (headerBlocks.length > 0) {
    // Just take the first header for the name/email line.
    // Or combine them if you wish.
    const firstHeader = headerBlocks[0]
    const name = escapeLatex(firstHeader.title || "Your Name")
    // We'll treat location as phone/email, etc. if user wants
    const phoneEmail = escapeLatex(firstHeader.location || "Email/Phone")
    const secondLine = escapeLatex(firstHeader.duration || "LinkedIn/GitHub")
    // The rest might go in description

    doc += `\\begin{center}
\\textbf{\\Huge ${name}} \\\\ 
\\small ${phoneEmail} $|$ ${secondLine} 
\\end{center}\n\n`
  }

  // 2) Group non-header blocks by sectionName
  const nonHeader = blocks.filter((b) => b.sectionName !== "Header")

  // Sort them by an order you like, or by the order they appear
  // We’ll just do them in the order of appearance on canvas:
  // (Alternatively, group them strictly by "Education", "Experience", etc.)
  const grouped: Record<string, Block[]> = {}
  for (const block of nonHeader) {
    const sec = block.sectionName
    if (!grouped[sec]) grouped[sec] = []
    grouped[sec].push(block)
  }

  // 3) Insert each group as a \section
  for (const sectionName of Object.keys(grouped)) {
    const group = grouped[sectionName]
    // Insert a \section line
    doc += `\\section{${escapeLatex(sectionName)}}\n`
    doc += "\\resumeSubHeadingListStart\n"

    for (const block of group) {
      doc += `\\resumeSubheading
{${escapeLatex(block.title)}}{${escapeLatex(block.duration || "")}}
{${escapeLatex(block.location || "")}}{}`

      // If block.description is multiline, we can bullet each line
      if (block.description) {
        doc += "\n\\resumeItemListStart\n"
        const lines = block.description.split("\n").map((l) => l.trim()).filter(Boolean)
        for (const line of lines) {
          doc += `  \\item ${escapeLatex(line)}\n`
        }
        doc += "\\resumeItemListEnd\n"
      }
    }

    doc += "\\resumeSubHeadingListEnd\n\n"
  }

  // 4) Close doc
  doc += defaultLatexPostamble
  return doc
}

/** Minimal function to escape LaTeX special chars */
function escapeLatex(str: string): string {
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

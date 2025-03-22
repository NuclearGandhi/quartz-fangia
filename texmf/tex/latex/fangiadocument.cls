\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{fangiadocument}

\LoadClass[a4paper,fontsize=12pt,twoside=true,numbers=enddot,parskip=half,toc=indentunnumbered]{scrbook}

%%% PACKAGES -------------------------------------------------------------------

\RequirePackage{luatex85}
\RequirePackage{scrhack}
\RequirePackage[dvipsnames,table]{xcolor}
\RequirePackage{scrlayer-scrpage}
\RequirePackage{accsupp}
\RequirePackage{amsmath,amssymb, cancel}
\RequirePackage{siunitx}
\RequirePackage[inkscapeformat=png]{svg}


%%% LANGUAGE
\RequirePackage[english, bidi=basic]{babel}
\babelprovide[import,main]{hebrew}

%%% FONTS
\babelfont{rm}{CMU Serif}
\babelfont{sf}{CMU Sans Serif}
\babelfont{tt}{CMU Typewriter Text Variable Width}
\babelfont[hebrew]{rm}{David}
\babelfont[hebrew]{sf}{David}
\babelfont[hebrew]{tt}{Courier New}

\selectlanguage{hebrew}

\RequirePackage{fontspec}

\RequirePackage[final,nopatch=footnote,babel=true]{microtype}
\DeclareMicrotypeAlias{CMU Serif}{TU-basic}
\DeclareMicrotypeAlias{David}{TU-basic}


%%% PACKAGES -------------------------------------------------------------------

\RequirePackage{caption}
\RequirePackage{ulem}
\RequirePackage{newfloat}
\RequirePackage{ifthen}
\RequirePackage{xifthen}
\RequirePackage{luacode}
\RequirePackage{soul}
\RequirePackage[version=4]{mhchem}
\RequirePackage{tocbasic}

%% LATEX 3 PACKAGES
\RequirePackage{etoolbox}
\RequirePackage{xparse}

\RequirePackage{multicol}

%%% TABLE PACKAGES
\RequirePackage{tabularray}

%%% GRAPHIC PACKAGES
\RequirePackage{graphicx}
\RequirePackage[export]{adjustbox}
\RequirePackage{epstopdf}
\RequirePackage{geometry}
\RequirePackage{grffile}
\let\quote@name\unquote@name % Fix grffile


\RequirePackage{hyperref}
\hypersetup{luatex,unicode,bookmarks=true,hyperindex=true,bookmarksopen=true,bookmarksnumbered=true}
\RequirePackage[amsmath,hyperref]{ntheorem}
\RequirePackage[hyperrefcolorlinks]{menukeys}


%%% Lua scripts
\directlua{require("fangiadocument.lua")}

%%%  NOCOLOR OPTION
%%% Define if it's in nocolor mode
\newtoggle{nocolor}
\togglefalse{nocolor}
\DeclareOption{nocolor}{\toggletrue{nocolor}}

%%% PRINTING OPTION
\newtoggle{print}
\togglefalse{print}
\DeclareOption{print}{\toggletrue{print}}

%%% CACHE OPTION
\newtoggle{cache}
\togglefalse{cache}
\DeclareOption{cache}{\toggletrue{cache}}
\ProcessOptions\relax

%%% BOX
\iftoggle{cache}{
   \PassOptionsToPackage{cache=true}{minted}
}{
   \PassOptionsToPackage{cache=false}{minted}
}
\RequirePackage[skins, minted, breakable, xparse]{tcolorbox}


%%% COLORS ---------------------------------------------------------------------

%%% Global color

\definecolor{defaultColor}{HTML}{424242}
\definecolor{alternativeTextColor}{HTML}{\iftoggle{nocolor}{000000}{FFFFFF}}

\definecolor{coverDateColor}{HTML}{\iftoggle{nocolor}{808080}{F8AD32}}

\definecolor{internalLinkColor}{HTML}{\iftoggle{nocolor}{4D4D4D}{FF9400}}
\definecolor{externalLinkColor}{HTML}{\iftoggle{nocolor}{4D4D4D}{1088BF}}

\definecolor{chapterColor}{HTML}{\iftoggle{nocolor}{000000}{EA9408}}
\definecolor{sectionColor}{HTML}{\iftoggle{nocolor}{000000}{EA9408}}
\definecolor{subsectionColor}{HTML}{\iftoggle{nocolor}{000000}{EA9408}}
\definecolor{subsubsectionColor}{HTML}{\iftoggle{nocolor}{000000}{EA9408}}
\definecolor{paragraphColor}{HTML}{000000}
\definecolor{subparagraphColor}{HTML}{000000}

\definecolor{iframeColor}{HTML}{009700}

\definecolor{titlePageBackgroundColor}{HTML}{\iftoggle{nocolor}{FFFFFF}{094561}}
\definecolor{titlePageEditorColor}{HTML}{\iftoggle{nocolor}{000000}{F8AD32}}
\definecolor{titlePageTextColor}{HTML}{\iftoggle{nocolor}{000000}{FFFFFF}}
\definecolor{titlePageAuthorColor}{HTML}{\iftoggle{nocolor}{4D4D4D}{FF9400}}

\definecolor{codeBackgroundColor}{HTML}{F7F7F7}
\definecolor{highlightCodeColor}{HTML}{E3E3E3}
\definecolor{lineNumberSeparatorCodeColor}{HTML}{BEBEC5}
\definecolor{lineNumberCodeColor}{HTML}{AEAEB5}

\definecolor{horizontalLineColor}{HTML}{CCCCCC}

%%%  BOX

% SUCCESS
\definecolor{boxForegroundSuccess}{HTML}{\iftoggle{nocolor}{424242}{3C763D}}
\definecolor{boxBackgroundSuccess}{HTML}{\iftoggle{nocolor}{FFFFFF}{DFF0D8}}
\definecolor{boxBorderSuccess}{HTML}{\iftoggle{nocolor}{4D4D4D}{C6D7BF}}
\definecolor{boxLogoBackgroundSuccess}{HTML}{\iftoggle{nocolor}{808080}{16C13B}}

% INFORMATION
\definecolor{boxForegroundInformation}{HTML}{\iftoggle{nocolor}{424242}{31708F}}
\definecolor{boxBackgroundInformation}{HTML}{\iftoggle{nocolor}{FFFFFF}{D9EDF7}}
\definecolor{boxBorderInformation}{HTML}{\iftoggle{nocolor}{4D4D4D}{C0D4DE}}
\definecolor{boxLogoBackgroundInformation}{HTML}{\iftoggle{nocolor}{808080}{59ABE3}}

% QUESTION
\definecolor{boxForegroundQuestion}{HTML}{\iftoggle{nocolor}{424242}{8D61CD}}
\definecolor{boxBackgroundQuestion}{HTML}{\iftoggle{nocolor}{FFFFFF}{F0E9FC}}
\definecolor{boxBorderQuestion}{HTML}{\iftoggle{nocolor}{4D4D4D}{D3BDF5}}
\definecolor{boxLogoBackgroundQuestion}{HTML}{\iftoggle{nocolor}{808080}{8C4FE8}}

% WARNING
\definecolor{boxForegroundWarning}{HTML}{\iftoggle{nocolor}{424242}{8A6D3B}}
\definecolor{boxBackgroundWarning}{HTML}{\iftoggle{nocolor}{FFFFFF}{FCF4E5}}
\definecolor{boxBorderWarning}{HTML}{\iftoggle{nocolor}{4D4D4D}{E3DBCC}}
\definecolor{boxLogoBackgroundWarning}{HTML}{\iftoggle{nocolor}{808080}{F39539}}

% ERROR
\definecolor{boxForegroundError}{HTML}{\iftoggle{nocolor}{424242}{A94442}}
\definecolor{boxBackgroundError}{HTML}{\iftoggle{nocolor}{FFFFFF}{F2DEDE}}
\definecolor{boxBorderError}{HTML}{\iftoggle{nocolor}{4D4D4D}{D9C5C5}}
\definecolor{boxLogoBackgroundError}{HTML}{\iftoggle{nocolor}{808080}{C21936}}

% NEUTRAL
\definecolor{boxForegroundNeutral}{HTML}{\iftoggle{nocolor}{424242}{424242}}
\definecolor{boxBackgroundNeutral}{HTML}{\iftoggle{nocolor}{FFFFFF}{FFFFFF}}
\definecolor{boxBorderNeutral}{HTML}{\iftoggle{nocolor}{4D4D4D}{4D4D4D}}
\definecolor{boxLogoBackgroundNeutral}{HTML}{\iftoggle{nocolor}{808080}{808080}}

% Iframe
\definecolor{boxForegroundIframe}{HTML}{\iftoggle{nocolor}{424242}{7BB027}}
\definecolor{boxBackgroundIframe}{HTML}{\iftoggle{nocolor}{FFFFFF}{F3FDE2}}
\definecolor{boxBorderIframe}{HTML}{\iftoggle{nocolor}{4D4D4D}{7BB027}}
\definecolor{boxLogoBackgroundIframe}{HTML}{\iftoggle{nocolor}{808080}{7BB027}}

% SPOILER
\definecolor{boxForegroundSpoiler}{HTML}{555555}
\definecolor{boxBackgroundSpoiler}{HTML}{EEEEEE}
\definecolor{boxBorderSpoiler}{HTML}{DDDDDD}

% QUOTATION
\definecolor{boxBorderLeftQuotation}{HTML}{CCCCCC}
\definecolor{boxForegroundQuotation}{HTML}{555555}

\hypersetup{linkcolor=internalLinkColor}

%%% CONSTANTS ------------------------------------------------------------------

\setlength{\tabcolsep}{0.2cm}
\renewcommand{\arraystretch}{1.5}

%%% FLOATS ---------------------------------------------------------------------

\DeclareFloatingEnvironment[name={Équation}]{equationFloat}

%%% ICONS ----------------------------------------------------------------------

\def\boxIcon{[draw=none] circle (0.4cm)}

\DeclareRobustCommand{\linkIcon}{\tikz[x=1.2ex, y=1.2ex, baseline=-0.05ex]{%
      \begin{scope}[x=1ex, y=1ex]
         \clip (-0.1,-0.1)
         --++ (-0, 1.2)
         --++ (0.6, 0)
         --++ (0, -0.6)
         --++ (0.6, 0)
         --++ (0, -1);
         \path[draw,
            line width = 0.5,
            rounded corners=0.5]
         (0,0) rectangle (1,1);
      \end{scope}
      \path[draw, line width = 0.5] (0.5, 0.5) -- (1, 1);
      \path[draw, line width = 0.5] (0.6, 1) -- (1, 1) -- (1, 0.6);}
}

%%% CLASS OPTIONS --------------------------------------------------------------

%%% SECTIONNING OPTIONS
\lohead{\headmark}
\chead{}
\pagestyle{scrheadings}

\newcommand{\addsubsec}[1]{
   \subsection*{#1}
   %\addxcontentsline{toc}{subsection}{#1}
}

\newcommand{\addsubsubsec}[1]{
   \subsubsection*{#1}
   %\addxcontentsline{toc}{subsubsection}{#1}
}

\newcommand{\addpar}[1]{
   \paragraph*{#1}
}

\newcommand{\addsubpar}[1]{
   \subparagraph*{#1}
}

\def\@introductionName{Introduction}
\def\@conclusionName{Conclusion}
\newcommand{\introductionName}[1]{\def\@introductionName{#1}}
\newcommand{\conclusionName}[1]{\def\@conclusionName{#1}}

\newcommand{\sectionningGenerator}[3]{
   \newenvironment{#1}{
      \csname#3\endcsname{#2}
      \let\levelTwoTitle\addsubsec
      \let\levelThreeTitle\addsubsubsec
      \let\levelFourTitle\addpar
      \let\levelFiveTitle\addsubpar
   }{}
}


\DeclareOption{small}{
   \let\levelOneTitle\section
   \let\levelTwoTitle\subsection
   \let\levelThreeTitle\subsubsection
   \let\levelFourTitle\paragraph
   \let\levelFiveTitle\subparagraph
   \def\thesection{\arabic{section}}
   \def\thefigure{\thesection.\arabic{figure}}
   \def\thetable{\thesection.\arabic{table}}
   \def\theequationFloat{\thesection.\arabic{equationFloat}}
   \automark[subsection]{section}
   \sectionningGenerator{LevelOneIntroduction}{\@introductionName}{addsec}
   \sectionningGenerator{LevelOneConclusion}{\@conclusionName}{addsec}
}


\DeclareOption{middle}{
   \newcommand{\levelOneTitle}[1]{\chapter{#1}}
   \let\levelTwoTitle\section
   \let\levelThreeTitle\subsection
   \let\levelFourTitle\subsubsection
   \let\levelFiveTitle\paragraph
   \let\levelSixTitle\subparagaph
   \automark[section]{chapter}
   \sectionningGenerator{LevelOneIntroduction}{\@introductionName}{addchap}
   \sectionningGenerator{LevelOneConclusion}{\@conclusionName}{addchap}
   \sectionningGenerator{LevelTwoIntroduction}{\@introductionName}{addsec}
   \sectionningGenerator{LevelTwoConclusion}{\@conclusionName}{addsec}
}

\DeclareOption{big}{
   \newcommand\levelOneTitle[1]{\part{#1}}
   \newcommand\levelTwoTitle[1]{\chapter{#1}}
   \let\levelThreeTitle\section
   \let\levelFourTitle\subsection
   \let\levelFiveTitle\subsubsection
   \let\levelSixTitle\paragraph
   \let\levelSevenTitle\subparagraph
   \counterwithin{chapter}{part}
   \automark[chapter]{part}
   \sectionningGenerator{LevelOneIntroduction}{\@introductionName}{addpart}
   \sectionningGenerator{LevelOneConclusion}{\@conclusionName}{addpart}
   \sectionningGenerator{LevelTwoIntroduction}{\@introductionName}{addchap}
   \sectionningGenerator{LevelTwoConclusion}{\@conclusionName}{addchap}
   \sectionningGenerator{LevelThreeIntroduction}{\@introductionName}{addsec}
   \sectionningGenerator{LevelThreeConclusion}{\@conclusionName}{addsec}
}

\RedeclareSectionCommands[tocdynnumwidth]{part,chapter,section,subsection,subsubsection}

%%% PROCESSING
\ProcessOptions

%%% POST-PROCESSING
\addtokomafont{chapter}{\color{chapterColor}}
\addtokomafont{section}{\color{sectionColor}}
\addtokomafont{subsection}{\color{subsectionColor}}
\addtokomafont{subsubsection}{\color{subsubsectionColor}}
\addtokomafont{paragraph}{\color{paragraphColor}}
\addtokomafont{subparagraph}{\color{subparagraphColor}}

\setcounter{secnumdepth}{4}

%%% GEOMETRY -----------------------------------------------------------------

\newgeometry{top=2.5cm, bottom=2.5cm, right=2cm,left=2cm}

%%% CUSTOMS ENVIRONMENTS AND MACROS ------------------------------------------

%%% LINKS
\newcommand{\externalLink}[2]{\iftoggle{print}{\textbf{[#1](#2)}}{\href{#2}{\color{externalLinkColor}{#1~~~~\linkIcon}}}}
\newcommand{\@titlePageLink}[2]{\href{#2}{\color{alternativeTextColor}{#1}}}

% %%% BOX
% \newcommand{\newBox}[3]{{%
%          \theoremprework{~\\ \textcolor{#3}{\rule{0.6\linewidth}{1pt}}}
%          \theorempostwork{\hfill \textcolor{#3}{\rule{0.6\linewidth}{1pt}} \\}
%          \theoremindent=2em
%          \theoremheaderfont{\scshape\hspace{-2em}}
%          \theoremseparator{ ---}
%          \theoremstyle{break}
%          \theorembodyfont{\normalfont}
%          \newtheorem*{#1}{\textcolor{#3}{#2}}
%       }}

% \newcommand{\newBoxEnvironment}[2]{%
%    \newenvironment{#1}{~\\ \begin{minipage}{\linewidth}\begin{#2}}
%    {\end{#2}\end{minipage}}
% }

% Create box icon
\newcommand{\createBoxIcon}[2]{
   \begin{tikzpicture} %
      \fill (0, 0.5) [color=#1] \boxIcon; %
      \draw (0, 0.5) \boxIcon node[draw=none, text=white, text width=0.5cm, align=flush center] {\Large\sffamily$\boldsymbol{#2}$}; %
   \end{tikzpicture} %
}

%%% DEFAULT BOX THEME

\tcbsetforeverylayer{%
   enhanced,
   enlarge top initially by=5mm,
   boxrule=0.5pt,
   breakable,
   arc=0.0pt,
}

\NewDocumentCommand\newBox{m m m m m o}{%
   \DeclareTColorBox{#1}{ o }{
      colback=#2,
      coltext=#3,
      colframe=#4,
      colbacktitle=#5,
      titlerule=0mm,
      IfValueTF={##1}{title=##1}{},
      halign title=flush right,
      overlay={
            \IfValueTF{#6}
            {\node at (frame.north west) {\createBoxIcon{#5}{#6}};}
            {}
         }
   }%
}

\newBox{SuccessBox}{boxBackgroundSuccess}{boxForegroundSuccess}{boxBorderSuccess}{boxLogoBackgroundSuccess}[\checkmark]
\newBox{InfoBox}{boxBackgroundInformation}{boxForegroundInformation}{boxBorderInformation}{boxLogoBackgroundInformation}[i]
\newBox{QuestionBox}{boxBackgroundQuestion}{boxForegroundQuestion}{boxBorderQuestion}{boxLogoBackgroundQuestion}[?]
\newBox{WarningBox}{boxBackgroundWarning}{boxForegroundWarning}{boxBorderWarning}{boxLogoBackgroundWarning}[!]
\newBox{ErrorBox}{boxBackgroundError}{boxForegroundError}{boxBorderError}{boxLogoBackgroundError}[\times]
\newBox{NotesBox}{boxBackgroundNeutral}{boxForegroundNeutral}{boxBorderNeutral}{boxLogoBackgroundNeutral}
\newBox{ExampleBox}{boxBackgroundIframe}{boxForegroundIframe}{boxBorderIframe}{boxLogoBackgroundIframe}[\#]

\DeclareTColorBox{Quotation}{ o }{%
   blanker,
   before skip=6pt,after skip=6pt,
   borderline west={1mm}{0pt}{boxBorderLeftQuotation},
   coltext=boxForegroundQuotation,
   left=18pt,
   parbox=false,
   IfValueTF={#1}{after upper={\par\center\textit{#1}}}{}
}


% This defines a new document environment called "Callout" which takes four arguments:
% 1. #1: The type of the callout.
% 2. #2: A title.
% 3. #3: A block of text in Hebrew to be displayed within the environment.
%
% The environment switches to English language for the outer environment and then
% switches back to Hebrew for the inner content. The outer environment is specified
% by the first argument (#1) and contains the Hebrew string (#2) and additional content (#3).
% The inner content is wrapped in a Hebrew environment to ensure proper language handling.
\NewDocumentEnvironment{Callout}{ m o +b }{
	\selectlanguage{english}
	\begin{#1}[{{\foreignlanguage{hebrew}{#2}}}]
		\begin{otherlanguage}{hebrew}
         #3
      \end{otherlanguage}
	\end{#1}
	\selectlanguage{hebrew}
}{}

%%% CODE MANAGEMENT
\tcbsetforeverylayer{} % Reset style

\setminted{
   breaklines,
   breaksymbolleft=\hspace{2em},
   highlightcolor=highlightCodeColor,
   linenos,
   fontsize=\small,
   baselinestretch=1,
   breakanywhere=true
}

\renewcommand\theFancyVerbLine{%
   \BeginAccSupp{ActualText={}}%
\small\textcolor{lineNumberCodeColor}{\arabic{FancyVerbLine}}%
\EndAccSupp{}%
}

\DeclareTCBListing{CodeBlock}{O{}O{}O{1}m}{%
enlarge top initially by=5mm,
enlarge bottom finally by=1mm,
boxrule=0.5pt,
breakable,
colback=codeBackgroundColor,
coltext=defaultColor,
colframe=boxBorderSpoiler,
arc=0.0pt,
listing engine=minted,
listing only,
minted style=colorful,
minted language=#4,
minted options={highlightlines={#2}, firstnumber=#3,numbersep=3mm},
enhanced,
overlay={\begin{tcbclipinterior}\fill[lineNumberSeparatorCodeColor] ([xshift=8mm-0.5pt]frame.south west)
         rectangle ([xshift=8mm]frame.north west);\end{tcbclipinterior}},
left=8mm,
title=#1,
attach boxed title to bottom center,
boxed title style={empty,boxrule=0.5mm},
coltitle=defaultColor
}

\sethlcolor{codeBackgroundColor}
\newcommand{\CodeInline}[1]{\texorpdfstring{\hl{\texttt{\small  #1}}}{#1}}

%%% IFRAMES
\NewDocumentCommand\iframe{mO{vidéo}o}{%
   \begin{Iframe}[#2]
      Consultez cet élément à l'adresse \url{#1}.\IfValueT{#3}{\\ #3}
   \end{Iframe}
}

%%% TABLES
% Remove default caption
\DefTblrTemplate{contfoot-text}{default}{}
\DefTblrTemplate{conthead-text}{default}{}
\DefTblrTemplate{caption}{default}{}
\DefTblrTemplate{conthead}{default}{}
\DefTblrTemplate{capcont}{default}{}

\NewTblrEnviron{tblr}
\SetTblrInner[tblr]{hlines,vlines,hspan=minimal}
\SetTblrOuter[tblr]{long}

%%% TITLE PAGE
%%% IMAGES
\NewDocumentCommand{\image}{mo}{%
   \begin{center}
      % If #1 has a '.svg' extension, we use the 'includesvg' command instead of 'includegraphics'
      \IfEndWith{#1}{.svg}
      {\includesvg[width=0.5\linewidth, height=0.9\textheight]{#1}}
      {\includegraphics[max width=0.6\linewidth, max height=0.9\textheight]{#1}}
      \IfValueT{#2}{\captionof{figure}{#2}}
   \end{center}
}

\DeclareRobustCommand*{\inlineImage}[1]{
   \IfEndWith{#1}{.svg}
   {\includesvg[width=0.5\linewidth, height=\textheight]{#1}}
   {\includegraphics[max size={\linewidth}{\textheight}, keepaspectratio]{#1}}
}

%%% HORIZONTAL LINE
\newcommand{\horizontalLine}{{\color{horizontalLineColor}\rule{\linewidth}{1.0pt}}}

%%% Hyperref -------------------------------------------------------------------


% Hyperref tries to use the content of the title to generate the PDF table of contents,
% but generate some errors in the process (since only letters are allowed there).
% Here, you can neuter the effect of some commands.

\pdfstringdefDisableCommands{
   \def\sout#1{}%
   \def\externalLink#1#2{#1}%
   \def\inlineImage#1{}%
}


%%% MathJax and KaTeX
\newcommand{\gt}{>}
\newcommand{\lt}{<}

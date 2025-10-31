import { QuartzTransformerPlugin } from "../types"
import { Root } from "hast"
import { visit } from "unist-util-visit"
import { Element } from "hast"

interface Options {
	/** Whether to apply course card transformation */
	enableCards: boolean
}

const defaultOptions: Options = {
	enableCards: true,
}

// Course icons mapping - can be extended for future courses
const courseIcons: Record<string, string> = {
	// Math & Physics
	CAL1: "∫", // Calculus
	CAL2: "∇", // Vector Calculus
	ALG1: "🧮", // Algebra
	DEQ1: "d", // Differential Equations
	PDE1: "∂", // Partial Differential Equations
	NUM1: "Σ", // Numerical Methods
	PHY1: "🔧", // Physics 1 (Mechanics)
	PHY2: "⚡", // Physics 2 (Electricity)
	PHY3: "🌌", // Physics 3 (Modern Physics)
	LPH1: "📏", // Physics Lab
	PSM1: "📊", // Probability and Statistics

	// Chemistry & Materials
	GCH1: "⚗️", // General Chemistry
	IMT1: "🧊", // Materials Engineering

	// Mechanics & Engineering
	SLD1: "🏗️", // Solid Mechanics 1
	SLD2: "🏗️", // Solid Mechanics 2
	DYN1: "⚙️", // Dynamics
	DVI1: "〰️", // Dynamics and Vibrations
	FLD1: "🌊", // Fluid Mechanics
	THE1: "🔥", // Thermodynamics
	HTF1: "🌡️", // Heat Transfer

	// Systems & Control
	LSY1: "📈", // Linear Systems
	ICT1: "🎛️", // Control Theory

	// Manufacturing & Design
	MNF1: "🏭", // Manufacturing Processes
	MDN1: "📐", // Mechanical Design
	FEM1: "🕸", // Finite Elements

	// Computer Science & Programming
	IPY1: "🐍", // Python Programming

	// Electrical & Electronics
	ELM1: "⚡", // Electric Drives

	// Robotics & Mechatronics
	IRB1: "🤖", // Robotics
	IME1: "⚙️", // Mechatronics
	MCS1: "🧩", // Micro-Systems Mechanics
	MCP1: "💻", // Microprocessor-Based Product Design

	// Lab & Practical
	LMA1: "🔬", // Advanced Lab

	// Specialized/Fun courses
	BMA1: "📚", // Basic Math
	FPH1: "💰", // Financial Physics
	CTH1: "🇨🇳", // Chinese Theory
	LGR1: "🇩🇪", // German Linear
	DFA1: "🌾", // Discrete Agriculture
	FCH1: "💹", // Financial Chinese Molecular
	MFB1: "🏓", // Microfabrication of Ping Pong Balls
}

// Helper function to detect Hebrew text
function containsHebrew(text: string): boolean {
	return /[\u0590-\u05FF]/.test(text)
}

// Helper function to extract course code from title
function extractCourseCodeFromTitle(title: string): string | null {
	const match = title.match(/^([A-Z]{2,4}\d+)/)
	return match ? match[1] : null
}

// Helper function to parse course title
function parseCourseTitle(title: string): {
	courseCode: string
	courseName: string
	courseNumber: string
} {
	// Pattern: COURSE_CODE_000 COURSE_NUMBER Course Name
	// Example: "GCH1_000 125001 כימיה כללית" or "LSY1_000 034032 Linear Systems E"
	const match = title.match(/^([A-Z]{2,4}\d+)_\d{3}\s+(\d{6,8})\s+(.+)$/)

	if (match) {
		return {
			courseCode: match[1],
			courseNumber: match[2],
			courseName: match[3].trim(),
		}
	}

	// Fallback: try to extract just course code and assume rest is name
	const fallbackMatch = title.match(/^([A-Z]{2,4}\d+)(.*)$/)
	if (fallbackMatch) {
		return {
			courseCode: fallbackMatch[1],
			courseNumber: "",
			courseName: fallbackMatch[2].replace(/^_\d{3}\s*\d*\s*/, "").trim(),
		}
	}

	return {
		courseCode: "",
		courseNumber: "",
		courseName: title,
	}
}

// Helper function to create card HTML
function createCourseCard(
	href: string,
	title: string,
	courseCode: string,
	isHebrew: boolean
): Element {
	const icon = courseIcons[courseCode] || "📖" // default icon
	const parsed = parseCourseTitle(title)

	return {
		type: "element",
		tagName: "div",
		properties: {
			className: ["course-card", isHebrew ? "rtl" : "ltr"],
		},
		children: [
			{
				type: "element",
				tagName: "a",
				properties: {
					href: href,
					className: ["course-link", "internal"],
					"data-slug": href.replace(/^\.\//, "").replace(/\.html$/, ""),
				},
				children: [
					{
						type: "element",
						tagName: "div",
						properties: {
							className: ["course-icon"],
						},
						children: [
							{
								type: "text",
								value: icon,
							},
						],
					},
					{
						type: "element",
						tagName: "div",
						properties: {
							className: ["course-info"],
						},
						children: [
							{
								type: "element",
								tagName: "div",
								properties: {
									className: ["course-name"],
								},
								children: [
									{
										type: "text",
										value: parsed.courseName,
									},
								],
							},
							{
								type: "element",
								tagName: "div",
								properties: {
									className: ["course-meta"],
								},
								children: [
									{
										type: "element",
										tagName: "span",
										properties: {
											className: ["course-code"],
										},
										children: [
											{
												type: "text",
												value: parsed.courseCode,
											},
										],
									},
									...(parsed.courseNumber ? [
										{
											type: "element" as const,
											tagName: "span" as const,
											properties: {
												className: ["course-number"],
											},
											children: [
												{
													type: "text" as const,
													value: ` • `,
												},
											],
										},
										{
											type: "element" as const,
											tagName: "span" as const,
											properties: {
												className: ["course-number"],
											},
											children: [
												{
													type: "text" as const,
													value: `${parsed.courseNumber}`,
												},
											],
										}] : []),
								],
							},
						],
					},
				],
			},
		],
	}
}

// Helper function to check if we're processing the index page
function isIndexPage(slug: string): boolean {
	return slug === "index" || slug === ""
}

export const CourseCards: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
	const opts = { ...defaultOptions, ...userOpts }

	return {
		name: "CourseCards",
		htmlPlugins(ctx) {
			return [
				() => {
					return (tree: Root, file) => {
						// Only apply to index page
						if (!isIndexPage(file.data.slug!)) {
							return
						}

						if (!opts.enableCards) {
							return
						}

						// Find and replace all ul elements that contain course links
						visit(tree, "element", (node, index, parent) => {
							if (
								node.tagName === "ul" &&
								parent &&
								typeof index === "number"
							) {
								// Check if this ul contains course links
								const courseCards: Element[] = []
								let hasCourseLinks = false

								node.children.forEach((child) => {
									if (child.type === "element" && child.tagName === "li") {
										// Look for course link in this list item
										visit(child, "element", (linkNode) => {
											if (
												linkNode.tagName === "a" &&
												linkNode.properties &&
												typeof linkNode.properties.href === "string" &&
												linkNode.children.length === 1 &&
												linkNode.children[0].type === "text"
											) {
												const href = linkNode.properties.href as string
												const title = linkNode.children[0].value
												const courseCode = extractCourseCodeFromTitle(title)

												// Check if this is a Technion course link
												if (courseCode && title.includes("_000")) {
													hasCourseLinks = true
													const isHebrew = containsHebrew(title)
													const card = createCourseCard(href, title, courseCode, isHebrew)
													courseCards.push(card)
												}
											}
										})
									}
								})

								// If we found course links, replace the ul with a card grid
								if (hasCourseLinks && courseCards.length > 0) {
									const cardGrid: Element = {
										type: "element",
										tagName: "div",
										properties: {
											className: ["course-grid"],
										},
										children: courseCards,
									}

									parent.children[index] = cardGrid
								}
							}
						})
					}
				},
			]
		},
		externalResources() {
			return {
				css: [
					{
						content: `/* Course Cards Styling */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.2rem;
  margin: 1.5rem 0;
  padding: 0;
  width: 100%;
  max-width: 1200px;
}

@media (min-width: 1024px) {
  .course-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .course-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .course-grid {
    grid-template-columns: 1fr;
  }
}

.course-card {
  border: 1px solid var(--lightgray);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: var(--light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--secondary);
}

.course-card.rtl {
  direction: rtl;
  text-align: right;
}

.course-card.ltr {
  direction: ltr;
  text-align: left;
}

a.course-link {
  display: flex;
  align-items: center;
  padding: 1rem;
  text-decoration: none;
  color: var(--dark);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  gap: 1rem;
  flex: 1;
}

.course-link:hover {
  color: var(--dark);
}

.course-card.rtl .course-link {
  flex-direction: row;
  text-align: right;
}

.course-card.ltr .course-link {
  flex-direction: row;
  text-align: left;
}

.course-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--secondary), var(--tertiary));
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.course-name {
  font-weight: 500;
  font-size: 0.95rem;
  line-height: 1.25;
  color: var(--dark);
  word-wrap: break-word;
  margin-bottom: 0.1rem;
}

.course-meta {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.8rem;
}

.course-code {
  font-weight: 600;
  color: var(--secondary);
  letter-spacing: 0.3px;
}

.course-number {
  font-weight: 400;
  color: var(--gray);
  opacity: 0.8;
  font-family: var(--codeFont);
}

/* Dark mode adjustments */
[data-theme="dark"] .course-card {
  background: var(--darkgray);
  border-color: var(--gray);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .course-card:hover {
  border-color: var(--secondary);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] .course-icon {
  background: linear-gradient(135deg, var(--secondary), var(--tertiary));
}

[data-theme="dark"] .course-name {
  color: var(--dark);
}

[data-theme="dark"] .course-number {
  color: var(--lightgray);
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .course-grid {
    gap: 1rem;
    margin: 1rem 0;
  }
  
  .course-card {
    min-height: 100px;
  }
  
  .course-link {
    padding: 1rem;
    gap: 0.8rem;
  }
  
  .course-icon {
    font-size: 1.2rem;
    width: 35px;
    height: 35px;
    border-radius: 6px;
  }
  
  .course-name {
    font-size: 0.85rem;
    line-height: 1.2;
  }
  
  .course-meta {
    font-size: 0.75rem;
  }
}

/* Ensure grid doesn't interfere with other content */
.course-grid + * {
  margin-top: 2rem;
}`,
						inline: true,
					},
				],
			}
		},
	}
}
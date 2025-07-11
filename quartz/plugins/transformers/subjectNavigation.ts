import { QuartzTransformerPlugin } from "../types"
import { Root } from "hast"
import { visit } from "unist-util-visit"
import { Element } from "hast"

interface Options {
    /** Whether to enable subject navigation */
    enableNavigation: boolean
}

const defaultOptions: Options = {
    enableNavigation: true,
}

// Global cache to track actual slugs for each course and subject number
const courseSubjectSlugs: Map<string, Map<number, string>> = new Map()

// Helper function to extract course code and subject number from slug
function parseSubjectSlug(slug: string): { courseCode: string; subjectNumber: number } | null {
    // Match CAL1_001 pattern in any part of the slug
    const match = slug.match(/([A-Z]+\d*)_(\d+)/)
    if (!match) return null

    const courseCode = match[1]
    const subjectNumber = parseInt(match[2], 10)

    return { courseCode, subjectNumber }
}

// Helper function to detect if content is in Hebrew
function isHebrewContent(slug: string): boolean {
    // Extract the title part after the subject code (e.g., after CAL1_005)
    const match = slug.match(/[A-Z]+\d*_\d+-(.+)/)
    if (!match) {
        return true // Default to Hebrew if can't determine
    }

    const title = match[1]
    if (!title) {
        return true
    }

    // Check if any character in the title is Hebrew
    // Hebrew Unicode range: \u0590-\u05FF
    const hasHebrew = /[\u0590-\u05FF]/.test(title)

    return hasHebrew
}

// Helper function to check if a slug represents a markdown file (not an image or other asset)
function isMarkdownFile(slug: string): boolean {
    // Prioritize files that don't end with image extensions
    return !slug.match(/\.(png|jpg|jpeg|gif|svg|webp|excalidraw)$/i)
}

// Register a subject in the cache, prioritizing markdown files
function registerSubject(courseCode: string, subjectNumber: number, slug: string) {
    if (!courseSubjectSlugs.has(courseCode)) {
        courseSubjectSlugs.set(courseCode, new Map())
    }
    const courseMap = courseSubjectSlugs.get(courseCode)!

    const existingSlug = courseMap.get(subjectNumber)

    // If no existing slug, or if the new slug is a markdown file and existing isn't, use the new one
    if (!existingSlug || (isMarkdownFile(slug) && !isMarkdownFile(existingSlug))) {
        courseMap.set(subjectNumber, slug)
    }
}

// Find the previous and next subjects for a given course and subject number
function findAdjacentSubjects(courseCode: string, currentSubjectNumber: number): {
    prevSlug: string | null
    nextSlug: string | null
} {
    const courseMap = courseSubjectSlugs.get(courseCode)
    if (!courseMap) {
        return { prevSlug: null, nextSlug: null }
    }

    // Get all subject numbers for this course and sort them
    const sortedSubjects = Array.from(courseMap.keys()).sort((a, b) => a - b)

    const currentIndex = sortedSubjects.indexOf(currentSubjectNumber)
    if (currentIndex === -1) {
        return { prevSlug: null, nextSlug: null }
    }

    const prevSubjectNumber = currentIndex > 0 ? sortedSubjects[currentIndex - 1] : null
    const nextSubjectNumber = currentIndex < sortedSubjects.length - 1 ? sortedSubjects[currentIndex + 1] : null

    return {
        prevSlug: prevSubjectNumber !== null ? courseMap.get(prevSubjectNumber) || null : null,
        nextSlug: nextSubjectNumber !== null ? courseMap.get(nextSubjectNumber) || null : null
    }
}

export const SubjectNavigation: QuartzTransformerPlugin<Options> = (userOpts) => {
    const opts = { ...defaultOptions, ...userOpts }

    return {
        name: "SubjectNavigation",
        htmlPlugins(ctx) {
            // Pre-populate the cache with all available subjects from ctx.allSlugs
            for (const slug of ctx.allSlugs) {
                const parsed = parseSubjectSlug(slug)
                if (parsed) {
                    registerSubject(parsed.courseCode, parsed.subjectNumber, slug)
                }
            }

            return [
                () => {
                    return (tree: Root, file) => {
                        const slug = file.data.slug as string

                        if (!opts.enableNavigation || !slug) {
                            return
                        }

                        const parsed = parseSubjectSlug(slug)
                        if (!parsed) {
                            return
                        }

                        const { courseCode, subjectNumber } = parsed

                        // Find adjacent subjects
                        const { prevSlug, nextSlug } = findAdjacentSubjects(courseCode, subjectNumber)

                        // Only add navigation if there's at least one adjacent subject
                        if (!prevSlug && !nextSlug) {
                            return
                        }

                        // Detect if content is in Hebrew
                        const isHebrew = isHebrewContent(slug)

                        // Create navigation elements
                        const navigationElements: Element[] = []

                        // For Hebrew (RTL): Next button on left, Previous button on right
                        // For English (LTR): Previous button on left, Next button on right

                        if (isHebrew) {
                            // Hebrew layout: Next (הבא) on left, Previous (קודם) on right

                            if (prevSlug) {
                                const prevSubjectNumber = parseSubjectSlug(prevSlug)?.subjectNumber
                                navigationElements.push({
                                    type: "element",
                                    tagName: "a",
                                    properties: {
                                        href: `/${prevSlug}`,
                                        className: ["subject-nav-btn", "subject-nav-prev"]
                                    },
                                    children: [
                                        {
                                            type: "text",
                                            value: `→ קודם: ${courseCode}_${prevSubjectNumber?.toString().padStart(3, '0')}`
                                        }
                                    ]
                                })
                            } else {
                                navigationElements.push({
                                    type: "element",
                                    tagName: "span",
                                    properties: {
                                        className: ["subject-nav-spacer"]
                                    },
                                    children: []
                                })
                            }

                            if (nextSlug) {
                                const nextSubjectNumber = parseSubjectSlug(nextSlug)?.subjectNumber
                                navigationElements.push({
                                    type: "element",
                                    tagName: "a",
                                    properties: {
                                        href: `/${nextSlug}`,
                                        className: ["subject-nav-btn", "subject-nav-next"]
                                    },
                                    children: [
                                        {
                                            type: "text",
                                            value: `הבא: ${courseCode}_${nextSubjectNumber?.toString().padStart(3, '0')} ←`
                                        }
                                    ]
                                })
                            } else {
                                navigationElements.push({
                                    type: "element",
                                    tagName: "span",
                                    properties: {
                                        className: ["subject-nav-spacer"]
                                    },
                                    children: []
                                })
                            }
                        } else {
                            // English layout: Previous on left, Next on right
                            if (prevSlug) {
                                const prevSubjectNumber = parseSubjectSlug(prevSlug)?.subjectNumber
                                navigationElements.push({
                                    type: "element",
                                    tagName: "a",
                                    properties: {
                                        href: `/${prevSlug}`,
                                        className: ["subject-nav-btn", "subject-nav-prev"]
                                    },
                                    children: [
                                        {
                                            type: "text",
                                            value: `← Previous: ${courseCode}_${prevSubjectNumber?.toString().padStart(3, '0')}`
                                        }
                                    ]
                                })
                            } else {
                                navigationElements.push({
                                    type: "element",
                                    tagName: "span",
                                    properties: {
                                        className: ["subject-nav-spacer"]
                                    },
                                    children: []
                                })
                            }

                            if (nextSlug) {
                                const nextSubjectNumber = parseSubjectSlug(nextSlug)?.subjectNumber
                                navigationElements.push({
                                    type: "element",
                                    tagName: "a",
                                    properties: {
                                        href: `/${nextSlug}`,
                                        className: ["subject-nav-btn", "subject-nav-next"]
                                    },
                                    children: [
                                        {
                                            type: "text",
                                            value: `Next: ${courseCode}_${nextSubjectNumber?.toString().padStart(3, '0')} →`
                                        }
                                    ]
                                })
                            } else {
                                navigationElements.push({
                                    type: "element",
                                    tagName: "span",
                                    properties: {
                                        className: ["subject-nav-spacer"]
                                    },
                                    children: []
                                })
                            }
                        }

                        // Create navigation container
                        const navigationContainer: Element = {
                            type: "element",
                            tagName: "nav",
                            properties: {
                                className: ["subject-navigation"],
                                style: `display: flex; justify-content: space-between; align-items: center; margin: 2rem 0; padding: 1rem; ${isHebrew ? 'direction: rtl;' : 'direction: ltr;'}`
                            },
                            children: navigationElements
                        }

                        // Add navigation at the beginning of the content
                        tree.children.unshift(navigationContainer)
                        // Add navigation at the end of the content
                        tree.children.push(navigationContainer)
                    }
                }
            ]
        }
    }
} 
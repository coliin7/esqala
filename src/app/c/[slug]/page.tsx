import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/admin"
import { LandingHero } from "@/components/landing/hero"
import { LandingOutcomes } from "@/components/landing/outcomes"
import { LandingAudience } from "@/components/landing/audience"
import { LandingSyllabus } from "@/components/landing/syllabus"
import { LandingTestimonials } from "@/components/landing/testimonials"
import { LandingCreator } from "@/components/landing/creator"
import { LandingPricing } from "@/components/landing/pricing"
import { LandingFooter } from "@/components/landing/footer"
import { StickyCTA } from "@/components/landing/sticky-cta"
import type { Course, CourseModule, Lesson, Testimonial, Profile } from "@/types"

export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: course } = await supabase
    .from("courses")
    .select("title, headline, description_long, hero_video_url")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!course) return { title: "Curso no encontrado" }

  return {
    title: course.headline || course.title,
    description: course.description_long?.substring(0, 160) || "",
    openGraph: {
      title: course.headline || course.title,
      description: course.description_long?.substring(0, 160) || "",
      type: "website",
    },
  }
}

export default async function CourseLandingPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: course } = await supabase
    .from("courses")
    .select(`
      *,
      creator:profiles!courses_creator_id_fkey(id, display_name, avatar_url, brand_name),
      modules:course_modules(
        id, title, position,
        lessons(id, title, position, video_duration_sec, is_free_preview)
      ),
      testimonials(*)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!course) notFound()

  const typedCourse = course as unknown as Course & {
    creator: Profile
    modules: (CourseModule & { lessons: Lesson[] })[]
    testimonials: Testimonial[]
  }

  // Sort modules and lessons by position
  typedCourse.modules.sort((a, b) => a.position - b.position)
  typedCourse.modules.forEach((m) =>
    m.lessons?.sort((a, b) => a.position - b.position)
  )
  typedCourse.testimonials?.sort((a, b) => a.position - b.position)

  // Calculate total duration
  const totalSeconds = typedCourse.modules.reduce(
    (sum, m) => sum + (m.lessons ?? []).reduce((s, l) => s + (l.video_duration_sec || 0), 0),
    0
  )
  const totalLessons = typedCourse.modules.reduce(
    (sum, m) => sum + (m.lessons ?? []).length,
    0
  )

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: typedCourse.headline || typedCourse.title,
    description: typedCourse.description_long,
    provider: {
      "@type": "Person",
      name: typedCourse.creator.display_name,
    },
    offers: {
      "@type": "Offer",
      price: typedCourse.price_ars,
      priceCurrency: "ARS",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background">
        <LandingHero
          headline={typedCourse.headline || typedCourse.title}
          subheadline={typedCourse.subheadline || ""}
          heroVideoUrl={typedCourse.hero_video_url}
          ctaText={typedCourse.cta_text}
          priceArs={typedCourse.price_ars}
          installmentsMax={typedCourse.installments_max}
          courseId={typedCourse.id}
          slug={slug}
        />

        {typedCourse.learning_outcomes.length > 0 && (
          <LandingOutcomes outcomes={typedCourse.learning_outcomes} />
        )}

        {typedCourse.target_audience.length > 0 && (
          <LandingAudience audience={typedCourse.target_audience} />
        )}

        {typedCourse.description_long && (
          <section className="py-16 px-4 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Sobre el curso</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground whitespace-pre-wrap">
              {typedCourse.description_long}
            </div>
          </section>
        )}

        {typedCourse.modules.length > 0 && (
          <LandingSyllabus
            modules={typedCourse.modules}
            totalLessons={totalLessons}
            totalSeconds={totalSeconds}
          />
        )}

        {typedCourse.testimonials.length > 0 && (
          <LandingTestimonials testimonials={typedCourse.testimonials} />
        )}

        <LandingCreator creator={typedCourse.creator} />

        <LandingPricing
          priceArs={typedCourse.price_ars}
          priceUsd={typedCourse.price_usd}
          installmentsMax={typedCourse.installments_max}
          ctaText={typedCourse.cta_text}
          courseId={typedCourse.id}
          courseName={typedCourse.title}
          slug={slug}
        />

        <LandingFooter />

        <StickyCTA
          priceArs={typedCourse.price_ars}
          installmentsMax={typedCourse.installments_max}
          ctaText={typedCourse.cta_text}
        />
      </div>
    </>
  )
}

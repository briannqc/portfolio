import BlogStats from "@/app/components/blog";
import Testimonial from "@/app/components/testimonial";
import Featured from "@/app/components/featured";

export default function Home() {
    const now = new Date()
    const yearOfExp = now.getUTCFullYear() - 2015
    let expDisplay: string
    if (now.getMonth() > 8) {
        expDisplay = `nearly ${yearOfExp + 1} years`
    } else {
        expDisplay = `over ${yearOfExp} years`
    }

    return (
        <main>
            <div>
                <h1 className="text-5xl font-bold">Hi, I&apos;m Brian!</h1>
                <p className="pt-6">
                    Product-minded Tech Lead with {expDisplay} of expertise in building large scale systems to serve
                    millions of MAU.
                    Proven success in leading green field projects, designing architectures, and mentoring teams.
                    Strong leadership, communication, and project management skills ensure on-time delivery with
                    high-quality standards.
                    Prolific tech blogger sharing insights on TDD, Clean Code, Concurrency, and Microservices.
                    Committed to continuous learning, driving innovation, and delivering cutting-edge solutions.
                </p>
                <p className="pt-6">
                    I&apos;m a strong believer of{" "}
                    <span className="font-semibold italic">
            &quot;Programs must be written for people to read, and only
            incidentally for machines to execute.&quot;
          </span>{" "}
                    To uphold this belief, I dedicate approximately 20 hours per week to
                    self-improvement and actively foster a culture of excellence through
                    mentoring and writing tech blogs.
                </p>
                <BlogStats/>
                <Featured/>
                <Testimonial/>
            </div>
        </main>
    )
}

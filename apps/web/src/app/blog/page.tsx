import { notFound } from "next/navigation";

import { BlogCard, BlogHeader, FeaturedBlogCard } from "@/components/blog-card";
import { PageBuilder } from "@/components/pagebuilder";
import { sanityFetch } from "@/lib/sanity/live";
import { queryBlogIndexPageData } from "@/lib/sanity/query";
import { getMetaData } from "@/lib/seo";

/**
 * Fetches blog posts data from Sanity CMS
 */
async function fetchBlogPosts() {
  return await sanityFetch({ query: queryBlogIndexPageData });
}

export async function generateMetadata() {
  try {
    const { data } = await fetchBlogPosts();
    return getMetaData(data ?? {});
  } catch {
    return getMetaData({});
  }
}

export default async function BlogIndexPage() {
  const { data } = await fetchBlogPosts();
  if (!data) notFound();

  const {
    blogs = [],
    title,
    description,
    pageBuilder = [],
    _id,
    _type,
    displayFeaturedBlogs,
    featuredBlogsCount,
  } = data;
  console.log("🚀 ~ BlogIndexPage ~ data:", data);

  // Ensure featuredBlogsCount is a number and provide a default value
  const validFeaturedBlogsCount = featuredBlogsCount
    ? Number.parseInt(featuredBlogsCount)
    : 0;

  // Handle empty blogs case
  if (!blogs.length) {
    return (
      <main className="container my-16 mx-auto px-4 md:px-6">
        <BlogHeader title={title} description={description} />
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No blog posts available at the moment.
          </p>
        </div>
        {pageBuilder && pageBuilder.length > 0 && (
          <PageBuilder pageBuilder={pageBuilder} id={_id} type={_type} />
        )}
      </main>
    );
  }

  // Check if featured blogs should be displayed
  const shouldDisplayFeaturedBlogs =
    displayFeaturedBlogs && validFeaturedBlogsCount > 0;

  // Extract featured blogs and remaining blogs
  const featuredBlogs = shouldDisplayFeaturedBlogs
    ? blogs.slice(0, validFeaturedBlogsCount)
    : [];
  const remainingBlogs = shouldDisplayFeaturedBlogs
    ? blogs.slice(validFeaturedBlogsCount)
    : blogs;

  return (
    <main className="bg-background">
      <div className="container my-16 mx-auto px-4 md:px-6">
        <BlogHeader title={title} description={description} />

        {/* Featured Blogs */}
        {featuredBlogs.length > 0 && (
          <div className="mx-auto mt-8 sm:mt-12 md:mt-16 mb-12 lg:mb-20 grid grid-cols-1 gap-8 md:gap-12">
            {featuredBlogs.map((blog) => (
              <FeaturedBlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}

        {/* Blog Grid */}
        {remainingBlogs.length > 0 && (
          <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2 mt-8">
            {remainingBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </div>

      {pageBuilder && pageBuilder.length > 0 && (
        <PageBuilder pageBuilder={pageBuilder} id={_id} type={_type} />
      )}
    </main>
  );
}

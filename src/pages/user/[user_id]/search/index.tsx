import { useRouter } from "next/router";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import Head from "next/head";
import { withAuth } from "@/utils/withAuth";
import { geistMono, geistSans } from "@/styles/font";
import TagPicker from "@/components/TagPicker";

function SearchPage() {
  const router = useRouter();
  const { user_id } = router.query;
  const onSearchQueryChange = (searchQuery: unknown) => {
    console.log(searchQuery);
  };

  const searchQuery = {
    tags: [],
  };

  if (!user_id || Array.isArray(user_id)) {
    return <p style={sharedStyles.error}>Invalid user ID</p>;
  }

  return (
    <>
      <Head>
        <title>Search - In-focus</title>
        <meta name="description" content="Add a new photo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={sharedStyles.page}
      >
        <main style={sharedStyles.main}>
          <div style={sharedStyles.breadcrumbs}>
            <Link href={`/user/${user_id}`} style={sharedStyles.link}>
              Account
            </Link>
            <span style={sharedStyles.separator}>/</span>
            <Link href={`/user/${user_id}/rolls`} style={sharedStyles.link}>
              Rolls
            </Link>
          </div>

          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>Search</h1>
            <TagPicker
              selectedTags={searchQuery.tags || []}
              onTagsChange={(tags) =>
                onSearchQueryChange({ ...searchQuery, tags })
              }
              disableAdd
              userId={user_id}
            />
          </div>
        </main>
        <footer style={sharedStyles.footer}>
          <Link
            href="https://github.com/DuckRabbitPy"
            target="_blank"
            rel="noopener noreferrer"
            style={sharedStyles.link}
          >
            DuckRabbitPy
          </Link>
        </footer>
      </div>
    </>
  );
}

export default withAuth(SearchPage);

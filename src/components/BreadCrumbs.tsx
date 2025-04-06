import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { useRouter } from "next/router";

type Route = {
  home?: boolean;
  search?: boolean;
  rolls?: boolean;
  roll?: boolean;
  photo?: boolean;
  edit?: boolean;
  view?: boolean;
  new_photo?: boolean;
};

type BreadCrumbProps<R extends Route> = {
  user_id: string;
  routes: R;
  roll_id: R["roll"] extends true ? number : number | undefined;
  photo_id: R["photo"] extends true ? number : number | undefined;
};

type BreadcrumbItemProps = {
  label: string;
  path: string;
  isEnabled?: boolean;
};

const BreadcrumbItem = ({ label, path, isEnabled }: BreadcrumbItemProps) => {
  const router = useRouter();
  const currentPath = router.asPath;

  if (!isEnabled) return null;

  const isTerminal = currentPath.split("?")[0] === path.split("?")[0];

  return (
    <>
      <span style={sharedStyles.separator}>/</span>
      {isTerminal ? (
        <span style={{ ...sharedStyles.link, cursor: "default" }}>{label}</span>
      ) : (
        <Link href={path} style={sharedStyles.link}>
          {label}
        </Link>
      )}
    </>
  );
};

export const Breadcrumbs = <R extends Route>({
  user_id,
  roll_id,
  photo_id,
  routes,
}: BreadCrumbProps<R>) => {
  const router = useRouter();
  const currentPath = router.asPath;

  const homePath = `/user/${user_id}`;
  const isHomeTerminal = currentPath === homePath;

  return (
    <div style={styles.breadcrumbs}>
      {routes.home &&
        (isHomeTerminal ? (
          <span style={{ ...sharedStyles.link, cursor: "default" }}>Home</span>
        ) : (
          <Link href={homePath} style={sharedStyles.link}>
            Home
          </Link>
        ))}

      <BreadcrumbItem
        label="Search"
        path={`/user/${user_id}/search`}
        isEnabled={routes.search}
      />

      <BreadcrumbItem
        label="Rolls"
        path={`/user/${user_id}/rolls`}
        isEnabled={routes.rolls}
      />

      <BreadcrumbItem
        label={`Roll #${roll_id}`}
        path={`/user/${user_id}/rolls/${roll_id}`}
        isEnabled={routes.roll}
      />

      <BreadcrumbItem
        label={`Photo #${photo_id}`}
        path={`/user/${user_id}/rolls/${roll_id}/${photo_id}/view`}
        isEnabled={routes.photo}
      />

      <BreadcrumbItem
        label="View"
        path={`/user/${user_id}/rolls/${roll_id}/${photo_id}/view`}
        isEnabled={routes.view}
      />

      <BreadcrumbItem
        label="Edit"
        path={`/user/${user_id}/rolls/${roll_id}/${photo_id}/edit`}
        isEnabled={routes.edit}
      />

      <BreadcrumbItem
        label="New Photo"
        path={`/user/${user_id}/rolls/${roll_id}/new_photo`}
        isEnabled={routes.new_photo}
      />
    </div>
  );
};

const styles = {
  breadcrumbs: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "0.5rem",
    alignItems: "center",
    fontSize: "0.9rem",
    color: "#666",
    marginBottom: "1.5rem",
    padding: "0.75rem",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
    overflowX: "auto" as const,
    "@media (minWidth: 640px)": {
      marginBottom: "2rem",
      padding: "1rem",
    },
    "@media (prefersColorScheme: dark)": {
      backgroundColor: "#1a1a1a",
      color: "#ccc",
    },
  },
};

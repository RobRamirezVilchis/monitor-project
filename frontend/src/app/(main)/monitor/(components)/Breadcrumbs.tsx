import Link from "next/link";

const Breadcrumbs = (props: {
  links: { href: string; name: string }[];
  pageName: string | undefined;
}) => {
  return (
    <div className="sm:flex space-y-2 sm:space-y-0 gap-2 text-4xl font-semibold">
      {props.links.map((link, i) => (
        <h1 key={i}>
          <Link
            href={link.href}
            className="text-neutral-400 dark:text-dark-300 hover:text-neutral-600 dark:hover:text-dark-200  transition-colors duration-200"
          >
            <span>{link.name}</span>
          </Link>
          <span className="ml-2 text-neutral-400 dark:text-dark-300">
            {"/"}
          </span>
        </h1>
      ))}
      {typeof props.pageName !== undefined && <h1>{props.pageName}</h1>}
    </div>
  );
};

export default Breadcrumbs;

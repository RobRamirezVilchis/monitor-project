import Link from "next/link";

const Breadcrumbs = (props: {
  links: { href: string; name: string }[];
  pageName: string | undefined;
}) => {
  return (
    <h1 className="flex gap-2 text-4xl font-semibold">
      {props.links.map((link) => (
        <>
          <Link
            href={link.href}
            className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400  transition-colors duration-200"
          >
            <p>{link.name}</p>
          </Link>
          <span className="text-gray-400 dark:text-gray-600">{"/"}</span>
        </>
      ))}
      {typeof props.pageName !== undefined && <span>{props.pageName}</span>}
    </h1>
  );
};

export default Breadcrumbs;

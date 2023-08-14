"use client";

import { FC, ReactNode } from "react";

import { AppBar, NavMenuItem } from "@/components/shared";
import { withAuth } from "@/components/auth/withAuth";

interface MainLayoutProps {
  children?: ReactNode;
}

const links: NavMenuItem[] = [
  {
    id: 1,
    label: "Home",
    href: "/",
  },
];

const MainLayout: FC<MainLayoutProps> = ({ children }) => { 
  
  return (
    <section className="h-full flex flex-col">
      <AppBar position="static" navMenuItems={links} />
      <main className="flex-[1_0_0] overflow-y-auto">
        {children}
      </main>
    </section>
  );
}

export default withAuth<any>(MainLayout);
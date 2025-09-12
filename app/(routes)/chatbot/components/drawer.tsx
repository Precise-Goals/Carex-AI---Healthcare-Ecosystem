"use client"
import {
  Drawer as DrawerComponent,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Link from "next/link";
import {IoMenuSharp } from "react-icons/io5";

const menuItems = [
  {
    id: 1,
    label: "Home",
    href: "/",
  },
  {
    id: 2,
    label: "Chatbot",
    href: "/chatbot",
  },
  {
    id: 3,
    label: "History",
    href: "/history",
  },
  {
    id: 4,
    label: "Pricing",
    href: "/pricing",
  },
  {
    id: 5,
    label: "Profile",
    href: "/profile",
  },
]

export default function Drawer() {
  return (
    <DrawerComponent>
      <DrawerTrigger>
        <IoMenuSharp className="text-2xl" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="px-6">
          <div className="">
            {menuItems.map((item) => (
              <Link key={item.id} href={item.href} className="mr-10 font-medium text-gray-500 hover:text-gray-900 flex items-center justify-start text-start gap-2">
                <span className="text-2xl text-start text-gray-500 hover:text-gray-900">{item.label}
                <div className="w-full h-[1px] bg-gray-200" />
                </span>
              </Link>
            ))}
          </div>
        </DrawerHeader>
      </DrawerContent>
    </DrawerComponent>
  );
}

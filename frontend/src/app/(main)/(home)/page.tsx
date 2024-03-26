"use client";

import { Button } from "@mantine/core";
import Link from "next/link";

import { ConfirmDialogProvider, NavLink } from "@/components/shared";
import { useAuth } from "@/hooks/auth";
import { refreshToken } from "@/api/services/auth";
import {
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
} from "@/ui/notifications";
import { useConfirmDialog } from "@/hooks/shared";
import { sleep } from "@/utils/utils";
import jwt from "@/api/jwt";
import { redirect } from "next/navigation";


// const Home = () => {
//   const { user, loading, login, logout, isAuthorized } = useAuth({
//     skipAll: false,
//     redirectIfNotAuthorized: false,
//     rolesWhitelist: ["Admin"]
//   });
//   const dialog1 = useConfirmDialog();
//   const dialog2 = useConfirmDialog({
//     title: "Title o1",
//     content: "Body o1",
//     onConfirm: () => {
//       console.log("confirm o1");
//     },
//   });
//   const dialog3 = useConfirmDialog({
//     title: "Title o1",
//     content: "Body o1",
//     onConfirm: () => {
//       console.log("confirm o1");
//     },
//   });

//   return (
//     <section className="h-full w-full p-4">
//       {!user && loading ? <div>Loading...</div> : null}
//       {user ? `User: ${user.email}, authorized: ${isAuthorized}` : null}

//       <br />

//       {user ? (
//         <div className="p-2 flex gap-2">
//           <button
//             className="p-2 bg-blue-500 text-white rounded-md"
//             onClick={() => logout()}
//           >
//             Logout
//           </button>

//           <button
//             className="p-2 bg-blue-500 text-white rounded-md"
//             onClick={async () => {
//               console.log(await jwt.getOrRefreshAccessToken((refresh) => refreshToken(refresh ?? undefined, { useJWT: false, rejectRequest: false, onError: false })))
//             }}
//           >
//             Refresh token
//           </button>

//           <button
//             className="p-2 bg-blue-500 text-white rounded-md"
//             onClick={async () => {
//               login({ socialLogin: { provider: "google", type: "connect" } })
//             }}
//           >
//             Connect account to Google
//           </button>

//           <button
//             className="p-2 bg-blue-500 text-white rounded-md"
//             onClick={async () => {
//               login({
//                 socialLogin: {
//                   provider: "google",
//                   providersOptions: {
//                     google: {
//                       scope: "https://www.googleapis.com/auth/calendar.readonly",
//                     },
//                   },
//                 },
//               });
//             }}
//           >
//             Add Google Calendar Scope
//           </button>

//           <button
//             className="p-2 bg-blue-500 text-white rounded-md"
//             onClick={async () => {
//               login({
//                 socialLogin: {
//                   provider: "google",
//                   providersOptions: {
//                     google: {
//                       scope: "https://spreadsheets.google.com/feeds/",
//                     },
//                   },
//                 },
//               });
//             }}
//           >
//             Add Google SpreadSheets Scope
//           </button>
//         </div>
//       ) : (
//         null
//       )}

//       <div className="p-2 flex gap-2">
//         <Link
//           href="auth/login"
//           className="p-2 bg-blue-500 text-white rounded-md"
//         >
//           Go to Login
//         </Link>
//       </div>

//       <div className="flex gap-2">
//         <NavLink href="/"
//           classes={{
//             active: "text-blue-500",
//             inactive: "text-red-500",
//           }}
//         >
//           Test
//         </NavLink>
//         <NavLink href="/test"
//           classes={{
//             active: "text-blue-500",
//             inactive: "text-red-500",
//           }}
//         >
//           Test
//         </NavLink>
//       </div>

//       <div className="flex gap-2 flex-wrap">
//         <Button
//           onClick={() => showSuccessNotification({
//             title: "Success notification",
//             message: "Success notification",
//           })}
//         >
//           Success Notification
//         </Button>

//         <Button
//           onClick={() => showErrorNotification({
//             title: "Error notification",
//             message: "Error notification",
//           })}
//         >
//           Error Notification
//         </Button>

//         <Button
//           onClick={() => showWarningNotification({
//             title: "Warning notification",
//             message: "Warning notification",
//           })}
//         >
//           Warning Notification
//         </Button>

//         <Button
//           onClick={() => showInfoNotification({
//             title: "Info notification",
//             message: "Info notification",
//           })}
//         >
//           Info Notification
//         </Button>
//       </div>

//       <div className="flex gap-2 flex-wrap mt-2">
//         <Button
//           onClick={() => {
//             dialog1.confirm();
//           }}
//         >
//           Open Default Dialog
//         </Button>

//         <Button
//           onClick={() => {
//             dialog1.confirm({
//               // title: "Tile of Async Dialog",
//               title: <div>Tile of Async Dialog</div>,
//               // content: "Body of Async Dialog",
//               content: (
//                 <div>
//                   <p>Body of Async Dialog</p>
//                   <p>Body of Async Dialog</p>
//                   <p>Body of Async Dialog</p>
//                   <p>Body of Async Dialog</p>
//                   <p>Body of Async Dialog</p>
//                 </div>
//               ),
//               // onConfirm: () => {
//               //   console.log("async dialog confirm in progress...");
//               //   return new Promise(resolve => setTimeout(resolve, 3000))
//               //     // .then(() => { throw new Error("Oops!") })
//               // },
//               onConfirm: async () => {
//                 console.log("async dialog confirmed...");
//                 await sleep(3000);
//                 throw new Error("Oops!");
//               },
//               onSuccess: () => {
//                 showSuccessNotification({
//                   title: "Success",
//                   message: "Async dialog closed",
//                 });
//               },
//               onError: (e) => {
//                 showErrorNotification({
//                   title: "Error",
//                   message: "Async dialog error",
//                 });
//                 console.log("async dialog error", e);
//                 dialog1.confirm({
//                   title: "Failed?",
//                   content: "Answer please",
//                   onConfirm: () => console.log("answered"),
//                 })
//               },
//               onClose: () => {
//                 console.log("async dialog closed");
//               },
//             });
//           }}
//         >
//           Open Async Dialog
//         </Button>

//         <Button
//           onClick={() => {
//             dialog2.confirm();
//           }}
//         >
//           Open Overrided in Hook Dialog
//         </Button>

//         <Button
//           onClick={() => {
//             dialog3.confirm({
//               title: "Title o2",
//               content: "Body o2",
//               onConfirm: () => {
//                 console.log("confirm o2");
//               },
//               modalProps: {
//                 centered: true,
//               },
//             });
//           }}
//         >
//           Open Deeply Overrided Dialog
//         </Button>
//       </div>
//     </section>
//   )
// }



// const HomeWrapper = () => {
//   return (
//     <ConfirmDialogProvider
//       modalProps={{
//         centered: true,
//       }}
//       labels={{
//         cancel: "Cancelar",
//       }}
//       confirmProps={{
//         color: "red",
//       }}
//       title="Confirmar acción"
//       content="¿Está seguro de realizar esta acción?"
//     >
//       <Home />
//     </ConfirmDialogProvider>
//   )
// }

const Home = () => {
  redirect("/monitor/safedriving");
}

export default Home;

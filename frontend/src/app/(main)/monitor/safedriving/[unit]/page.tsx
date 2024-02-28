'use client'

import { withAuth } from "@/components/auth/withAuth";


const UnitPage = ({ params }: { params: { unit: string } }) => {
    
    return (
        <div className="flex items-center">
            <h1 className="ml-10 text-5xl font-bold py-2 flex-1 my-6">
                Unidad {params.unit}
            </h1>
        </div>
    )
    
}

//export default UnitPage;
export default withAuth(UnitPage, {
    rolesWhitelist: ["Admin"],
  });
import { FormLupaPassword } from "@/components/lupa-password/form-lupaPassword"
export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <FormLupaPassword />
      </div>
    </div>
  )
}
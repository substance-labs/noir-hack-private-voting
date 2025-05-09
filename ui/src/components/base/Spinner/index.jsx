import { Loader2 } from "lucide-react"

const Spinner = ({ text }) => (
  <div className="flex flex-col items-center space-y-4">
    <Loader2 className="w-12 h-12 animate-spin text-white" />
    {text && <p className="text-md text-gray-400">{text}</p>}
  </div>
)

export default Spinner

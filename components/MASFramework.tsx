import { MASFramework as MASFrameworkType } from "@/lib/types";

export default function MASFramework({ framework }: { framework: MASFrameworkType }) {
  return (
    <div className="flex justify-center gap-4">
      {(["values", "goals", "brand"] as const).map((key) => (
        <div key={key} className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-semibold capitalize">{key}</span>
          </div>
          <ul className="mt-2 text-sm">
            {framework[key].map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
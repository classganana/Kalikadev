/**
 * Specification table - Clean two-column layout.
 * Server component.
 */
interface SpecRow {
  label: string;
  value: string | number;
}

interface SpecTableProps {
  specs: SpecRow[];
}

export function SpecTable({ specs }: SpecTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-left">
        <tbody>
          {specs.map(({ label, value }, i) => (
            <tr
              key={label}
              className={`border-zinc-200 dark:border-zinc-800 ${
                i < specs.length - 1 ? "border-b" : ""
              }`}
            >
              <th className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {label}
              </th>
              <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-white">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

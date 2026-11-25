import { z } from "zod";
import { modules } from "~~/shared/analytics/workspace";
const schema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("light"),
  collapsed: z.boolean().default(false),
  home: z.enum(modules.map((m) => m.id)).default("overview"),
  density: z.enum(["comfortable", "compact"]).default("comfortable"),
});
export function useAppearance() {
  const appearance = useState("zonhack:appearance", () => schema.parse({}));
  onMounted(() => {
    try {
      const result = schema.safeParse(
        JSON.parse(localStorage.getItem("zonhack:demo:appearance") || "null"),
      );
      if (result.success) appearance.value = result.data;
    } catch {
      /* use defaults */
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const paint = () => {
      const dark =
        appearance.value.theme === "dark" ||
        (appearance.value.theme === "system" && media.matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document.documentElement.dataset.density = appearance.value.density;
    };
    paint();
    media.addEventListener("change", paint);
    const stop = watch(
      appearance,
      () => {
        paint();
        try {
          localStorage.setItem(
            "zonhack:demo:appearance",
            JSON.stringify(appearance.value),
          );
        } catch {
          /* session-only */
        }
      },
      { deep: true },
    );
    onBeforeUnmount(() => {
      media.removeEventListener("change", paint);
      stop();
    });
  });
  return appearance;
}

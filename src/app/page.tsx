import { AvatarDebugPanel } from "@/components/avatar/AvatarDebugPanel";
import { AvatarCanvas } from "@/components/scene/AvatarCanvas";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-app md:flex-row">
      <aside className="w-full border-b border-panel-border bg-panel p-4 md:h-screen md:w-[380px] md:overflow-y-auto md:border-r md:border-b-0">
        <AvatarDebugPanel />
      </aside>
      <section className="relative min-h-[60vh] flex-1 md:min-h-screen">
        <AvatarCanvas />
      </section>
    </main>
  );
}

import TutorialForm from "@/components/TutorialForm";
import VersionHistory from "@/components/VersionHistory";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTutorialPage({ params }: EditPageProps) {
  const { id } = await params;
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <VersionHistory tutorialId={id} />
      </div>
      <TutorialForm mode="edit" tutorialId={id} />
    </div>
  );
}

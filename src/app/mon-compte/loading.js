export default function MonCompteLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Skeleton alerte */}
      <div className="h-14 bg-gray-200 rounded-[25px] w-full" />

      {/* Skeleton grille widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-48 bg-gray-200 rounded-[25px]" />
        <div className="h-48 bg-gray-200 rounded-[25px]" />
        <div className="h-48 bg-gray-200 rounded-[25px]" />
        <div className="h-32 bg-gray-200 rounded-[25px] md:col-span-2 lg:col-span-1" />
        <div className="h-32 bg-gray-200 rounded-[25px]" />
        <div className="h-32 bg-gray-200 rounded-[25px]" />
      </div>
    </div>
  );
}

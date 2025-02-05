export default function ChoixProfilLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] relative overflow-hidden">
      {/* Cercle décoratif en haut à gauche */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#FF721C] to-[#FF9B5C] rounded-full opacity-10 blur-3xl" />
      
      {/* Cercle décoratif en bas à droite */}
      <div className="absolute -bottom-60 -right-60 w-[500px] h-[500px] bg-gradient-to-br from-[#FF721C] to-[#FF9B5C] rounded-full opacity-10 blur-3xl" />
      
      {children}
    </div>
  )
}

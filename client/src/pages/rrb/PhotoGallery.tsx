import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, MapPin, Calendar, X, ChevronLeft, ChevronRight, Shield, Scale, Info } from 'lucide-react';

interface ArchivePhoto {
  id: number;
  src: string;
  title: string;
  caption: string;
  location: string;
  year: string;
  category: 'performance' | 'travel' | 'personal' | 'media' | 'documentary' | 'family';
  attribution: string;
  context: string;
}

const photos: ArchivePhoto[] = [
  {
    id: 1,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/TsQGRavchPQvriXx.PNG',
    title: 'Candy at the Piano, Wembley Stadium',
    caption: 'Seabrun "Candy" Hunter performing at the piano during a live concert at Wembley Stadium, London.',
    location: 'Wembley Stadium, London, England',
    year: 'c. 1972',
    category: 'performance',
    attribution: 'Hunter Family Archive',
    context: 'Historical documentation of Seabrun Hunter\'s career as a performing musician at one of the world\'s most iconic venues.',
  },
  {
    id: 2,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/lUlownRqBqvbOiNt.PNG',
    title: 'Candy at Piano — Wembley Concert',
    caption: 'Another angle of Candy Hunter commanding the piano at Wembley, showcasing his musical artistry.',
    location: 'Wembley Stadium, London, England',
    year: 'c. 1972',
    category: 'performance',
    attribution: 'Hunter Family Archive',
    context: 'Archival photograph documenting Seabrun Hunter\'s live performance career in the United Kingdom.',
  },
  {
    id: 3,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/NxkXplhLDiCMFRkF.PNG',
    title: 'Wembley Stadium Performance',
    caption: 'A wide view of the Wembley performance, capturing the energy and scale of the live show.',
    location: 'Wembley Stadium, London, England',
    year: 'c. 1972',
    category: 'performance',
    attribution: 'Hunter Family Archive',
    context: 'Historical record of live music performances at Wembley Stadium during the early 1970s rock and roll era.',
  },
  {
    id: 4,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/PiWuJaTETwrqjRLt.PNG',
    title: 'Arriving at Heathrow Airport',
    caption: 'Little Richard and Candy Hunter arriving at London Heathrow Airport for their UK tour dates.',
    location: 'Heathrow Airport, London, England',
    year: 'August 1972',
    category: 'travel',
    attribution: 'Hunter Family Archive',
    context: 'Historical documentation of international touring by American musicians in the United Kingdom, August 1972.',
  },
  {
    id: 5,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/NInuILjAbGNxhBkZ.JPEG',
    title: 'London Airport Arrival, August 3rd, 1972',
    caption: 'Documented arrival at London Airport on August 3rd, 1972 — a key date in the European tour schedule.',
    location: 'London Airport, England',
    year: 'August 3, 1972',
    category: 'travel',
    attribution: 'Press photograph, August 1972',
    context: 'Press documentation of American musicians arriving for UK concert dates. Used for historical and biographical commentary.',
  },
  {
    id: 6,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/XqHzOLLEryRGcAff.PNG',
    title: 'Candy and Little Richard',
    caption: 'Seabrun "Candy" Hunter alongside his cousin Little Richard — a bond of family and music.',
    location: 'United States',
    year: 'c. 1970s',
    category: 'personal',
    attribution: 'Hunter Family Archive',
    context: 'Family photograph documenting the personal and professional relationship between Seabrun Hunter and Richard Penniman (Little Richard).',
  },
  {
    id: 7,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/QpOLRPgvbNlLJEAJ.PNG',
    title: 'King Richard and I',
    caption: 'A treasured photograph titled "King Richard and I" — Candy Hunter with Little Richard, his cousin and musical collaborator.',
    location: 'United States',
    year: 'c. 1970s',
    category: 'personal',
    attribution: 'Hunter Family Archive',
    context: 'Personal family photograph documenting the familial bond between Seabrun Hunter and Little Richard (Richard Penniman).',
  },
  {
    id: 8,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/dtUKgGMQrCKWhqAe.PNG',
    title: 'Rare Photo of Cousin Richard',
    caption: 'A rare personal photograph of Little Richard — from the private collection of the Hunter family.',
    location: 'United States',
    year: 'c. 1970s',
    category: 'personal',
    attribution: 'Hunter Family Archive',
    context: 'Rare personal photograph from the Hunter family\'s private collection, documenting the life of Richard Penniman (Little Richard).',
  },
  {
    id: 9,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/aKyKolMiSNSIkIYL.JPEG',
    title: 'Little Richard — The Architect of Rock and Roll',
    caption: 'Richard Wayne Penniman, known as Little Richard — cousin of Seabrun "Candy" Hunter and one of the founding fathers of rock and roll.',
    location: 'United States',
    year: 'c. 1970s',
    category: 'personal',
    attribution: 'Press photograph; used for historical commentary',
    context: 'Historical press photograph used in the context of biographical commentary on the Hunter-Penniman family legacy in American music.',
  },
  {
    id: 10,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/qNOtlCpilKWXIcml.PNG',
    title: 'Copenhagen, Denmark',
    caption: 'Candy Hunter in Copenhagen, Denmark during the European tour — bringing rock and roll across the continent.',
    location: 'Copenhagen, Denmark',
    year: 'c. 1972',
    category: 'travel',
    attribution: 'Hunter Family Archive',
    context: 'Historical documentation of American musicians touring Scandinavia during the early 1970s.',
  },
  {
    id: 11,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/fgPgfRlzBBrITUWr.PNG',
    title: 'Copenhagen Performance',
    caption: 'Live performance in Copenhagen, Denmark — part of the international tour that took Candy across Europe.',
    location: 'Copenhagen, Denmark',
    year: 'c. 1972',
    category: 'performance',
    attribution: 'Hunter Family Archive',
    context: 'Archival documentation of live musical performances in Scandinavia during the 1970s rock and roll era.',
  },
  {
    id: 12,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/ZSrysHYZgGQXKDoq.PNG',
    title: 'Performance in Germany',
    caption: 'Candy Hunter performing in Germany — one of many European stops on the international concert circuit.',
    location: 'Germany',
    year: 'c. 1972',
    category: 'performance',
    attribution: 'Hunter Family Archive',
    context: 'Historical documentation of American rock and roll performances in Germany during the early 1970s.',
  },
  {
    id: 13,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/RiAlTYSJtiOfcGYy.PNG',
    title: 'Yahoo News Coverage',
    caption: 'Yahoo News article covering the story of Candy Hunter and Little Richard — media documentation of the legacy.',
    location: 'Online Media',
    year: 'Modern',
    category: 'media',
    attribution: 'Yahoo News screenshot; used for commentary and criticism',
    context: 'Screenshot of news coverage used for purposes of commentary, criticism, and historical documentation of the Hunter family legacy.',
  },
  {
    id: 14,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/GipBWeOOhYayWKGC.PNG',
    title: 'Tamara Hall Show Feature',
    caption: 'The Tamara Hall Show featuring coverage related to the Little Richard and Hunter family story.',
    location: 'Television Broadcast',
    year: 'Modern',
    category: 'media',
    attribution: 'Television broadcast screenshot; used for commentary',
    context: 'Television broadcast screenshot used for purposes of commentary and criticism regarding the Hunter family\'s documented connection to Little Richard.',
  },
  {
    id: 15,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/iYQIrMyLsPkHoYwW.PNG',
    title: '"I Am Everything" Documentary',
    caption: 'Promotional material for the "I Am Everything" documentary about Little Richard — featuring the story that connects to the Hunter family legacy.',
    location: 'Documentary Film',
    year: 'Modern',
    category: 'documentary',
    attribution: 'Documentary promotional material; used for commentary and review',
    context: 'Documentary promotional material used for purposes of commentary, criticism, and review in connection with the Hunter family\'s documented history.',
  },
  {
    id: 16,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/KPjoxyctvwHlxKjk.PNG',
    title: 'Backstage with Little Richard',
    caption: 'A rare backstage photograph showing Little Richard with friends and family members after a performance.',
    location: 'Backstage, Concert Venue',
    year: 'c. 1970s',
    category: 'personal',
    attribution: 'Hunter Family Archive',
    context: 'Private family photograph documenting backstage moments during the touring years.',
  },
  {
    id: 17,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/nFVxQsUswNIAulPd.JPG',
    title: 'Helen Hunter — Life Care Leader Cover',
    caption: 'Helen Hunter on the cover of Life Care Leader magazine, 2014 Edition — "Beauty More Than Skin Deep."',
    location: 'Life Care Centers of America',
    year: '2014',
    category: 'family',
    attribution: 'Life Care Leader magazine, 2014; reproduced with family authorization',
    context: 'Magazine cover featuring Helen Hunter, grandmother of the Hunter family, recognized for her remarkable life story as a polio survivor, model, nurse, and Mary Kay pioneer.',
  },
  {
    id: 18,
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/FUNFfoBCLSCFUdqP.JPG',
    title: 'Helen Hunter — Magazine Article Spread',
    caption: 'The full two-page spread of Helen Hunter\'s feature article "Beauty More Than Skin Deep" in Life Care Leader.',
    location: 'Life Care Centers of America',
    year: '2014',
    category: 'family',
    attribution: 'Life Care Leader magazine, 2014; reproduced with family authorization',
    context: 'Feature article documenting Helen Hunter\'s journey from Campbell, Ohio through polio recovery, modeling, nursing, and becoming the first Black senior director at Mary Kay Cosmetics.',
  },
];

type FilterCategory = 'all' | 'performance' | 'travel' | 'personal' | 'media' | 'documentary' | 'family';

const categoryColors: Record<string, string> = {
  performance: 'bg-amber-600',
  travel: 'bg-blue-600',
  personal: 'bg-rose-600',
  media: 'bg-purple-600',
  documentary: 'bg-emerald-600',
  family: 'bg-pink-600',
};

const categoryLabels: Record<string, string> = {
  performance: 'Live Performance',
  travel: 'Tour & Travel',
  personal: 'Personal & Family',
  media: 'Media Coverage',
  documentary: 'Documentary',
  family: 'Helen Hunter',
};

export default function PhotoGallery() {
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredPhotos = filter === 'all' ? photos : photos.filter(p => p.category === filter);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length);
    }
  };

  const goPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  };

  const currentPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 border-b border-amber-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/15 via-transparent to-transparent" />
        <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
          <Badge className="bg-amber-700 text-white mb-4 text-sm px-4 py-1">
            <Camera className="w-3.5 h-3.5 mr-2" />
            Legacy Archive
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-amber-100 mb-4">
            Photo Gallery
          </h1>
          <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto leading-relaxed">
            A visual journey through the life and career of Seabrun "Candy" Hunter Jr. —
            from Wembley Stadium to Copenhagen, from family moments to international stages.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-stone-500">
            <span className="flex items-center gap-1.5">
              <Camera className="w-4 h-4" />
              {photos.length} Photographs
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              5 Countries
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              1970s — Present
            </span>
          </div>
        </div>
      </div>

      {/* Fair Use Notice */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-amber-950/40 border border-amber-800/30 rounded-xl p-4 md:p-6">
          <div className="flex items-start gap-3">
            <Scale className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-300 mb-1">Fair Use & Editorial Notice</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                This gallery is presented as a historical and biographical archive documenting the life and career
                of Seabrun "Candy" Hunter Jr. Photographs from the Hunter Family Archive are published with family
                authorization. Third-party press photographs and media screenshots are reproduced under the fair use
                doctrine (17 U.S.C. § 107) for purposes of commentary, criticism, historical documentation, and
                biographical scholarship. No commercial exploitation of third-party copyrighted material is intended.
                All attributed sources retain their respective copyrights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { key: 'all' as FilterCategory, label: `All (${photos.length})` },
            { key: 'performance' as FilterCategory, label: `Performances (${photos.filter(p => p.category === 'performance').length})` },
            { key: 'travel' as FilterCategory, label: `Tour & Travel (${photos.filter(p => p.category === 'travel').length})` },
            { key: 'personal' as FilterCategory, label: `Personal (${photos.filter(p => p.category === 'personal').length})` },
            { key: 'media' as FilterCategory, label: `Media (${photos.filter(p => p.category === 'media').length})` },
            { key: 'documentary' as FilterCategory, label: `Documentary (${photos.filter(p => p.category === 'documentary').length})` },
            { key: 'family' as FilterCategory, label: `Helen Hunter (${photos.filter(p => p.category === 'family').length})` },
          ].map(tab => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(tab.key)}
              className={filter === tab.key
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'border-stone-700 text-stone-400 hover:text-white hover:border-amber-700 bg-transparent'}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Photo Grid */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPhotos.map((photo, index) => (
            <Card
              key={photo.id}
              className="group bg-stone-900/60 border-stone-800/50 overflow-hidden cursor-pointer hover:border-amber-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/20"
              onClick={() => openLightbox(index)}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-800">
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-full object-contain bg-black group-hover:scale-[1.02] transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <Badge className={`${categoryColors[photo.category]} text-white text-[10px] px-2 py-0.5`}>
                    {categoryLabels[photo.category]}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="bg-black/70 backdrop-blur-sm border-white/20 text-white text-[10px] px-2 py-0.5">
                    {photo.year}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white text-sm font-medium">Click to view full size</p>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-amber-200 leading-tight">{photo.title}</h3>
                <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">{photo.caption}</p>
                <div className="flex items-center gap-3 pt-1 text-[10px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {photo.location}
                  </span>
                </div>
                <p className="text-[10px] text-stone-600 italic">Source: {photo.attribution}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && currentPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            className="max-w-5xl w-full mx-4 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentPhoto.src}
              alt={currentPhoto.title}
              className="max-h-[70vh] w-auto object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-6 text-center max-w-2xl">
              <h3 className="text-xl font-bold text-amber-200 mb-2">{currentPhoto.title}</h3>
              <p className="text-sm text-stone-300 mb-2">{currentPhoto.caption}</p>
              <div className="flex items-center justify-center gap-4 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {currentPhoto.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {currentPhoto.year}
                </span>
              </div>
              <p className="text-[10px] text-stone-600 mt-3 italic">
                Source: {currentPhoto.attribution} — {currentPhoto.context}
              </p>
              <p className="text-[10px] text-stone-700 mt-1">
                {lightboxIndex + 1} of {filteredPhotos.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Disclaimer */}
      <div className="border-t border-stone-800/50 bg-stone-950">
        <div className="container mx-auto px-4 py-10 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-stone-500">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Copyright & Legal Notice</span>
          </div>
          <div className="max-w-3xl mx-auto space-y-3 text-xs text-stone-600 leading-relaxed">
            <p>
              <strong className="text-stone-500">Family Archive Materials:</strong> Photographs identified as "Hunter Family Archive"
              are published with the authorization of the Hunter family estate and Canryn Production Inc.
              All rights to these materials are retained by the Hunter family.
            </p>
            <p>
              <strong className="text-stone-500">Third-Party Materials:</strong> Press photographs, news screenshots, and documentary
              promotional materials are reproduced under the fair use doctrine (17 U.S.C. § 107) strictly for purposes of
              commentary, criticism, news reporting, and historical/biographical scholarship. These materials are presented
              in a transformative context with editorial commentary. No commercial exploitation is intended.
              All original copyrights are retained by their respective owners.
            </p>
            <p>
              <strong className="text-stone-500">DMCA Compliance:</strong> If you are the copyright holder of any material
              presented in this archive and believe its use does not constitute fair use, please contact us and the
              material will be promptly reviewed and removed if appropriate.
            </p>
            <p className="text-stone-700 pt-2">
              This archive is maintained by Canryn Production Inc. as part of the Seabrun "Candy" Hunter Jr. Legacy Project.
              <br />A Canryn Production and its subsidiaries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

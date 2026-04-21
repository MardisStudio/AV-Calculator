"use client"

import Image from "next/image"
import { useEffect, useId, useMemo, useRef, useState } from "react"

import {
  RiArrowDownSLine,
  RiArrowRightLine,
  RiCameraLensLine,
  RiHome4Line,
  RiHomeGearLine,
  RiLightbulbFlashLine,
  RiLock2Line,
  RiRouterLine,
  RiSoundModuleLine,
  RiTv2Line,
} from "@remixicon/react"
import { AnimatePresence, motion } from "motion/react"

import { Button } from "@/components/ui/button"

type Option = { id: string; label: string; basePrice: number }

const tvOptions: Option[] = [
  { id: "tv-stereo", label: "TV with stereo speakers", basePrice: 1200 },
  { id: "tv-soundbar", label: "TV with soundbar", basePrice: 1800 },
  { id: "tv-surround", label: "TV with surround sound", basePrice: 4200 },
  { id: "tv-only", label: "TV only", basePrice: 900 },
]

const securityOptions: Option[] = [
  { id: "burglary", label: "Burglary only", basePrice: 1600 },
  { id: "burglary-fire", label: "Burglary & fire", basePrice: 2800 },
  {
    id: "surveillance",
    label: "Surveillance cameras, doorbell, or gate station",
    basePrice: 3200,
  },
]

const houseAudioOptions: Option[] = [
  {
    id: "architectural",
    label: "Stereo pair - architectural (in-ceiling/in-wall/small aperture)",
    basePrice: 1500,
  },
  { id: "on-wall", label: "Stereo pair - on wall or in room", basePrice: 1250 },
  { id: "invisible", label: "Stereo pair - invisible", basePrice: 2200 },
  { id: "surround-51", label: "Surround sound - 5.1", basePrice: 5200 },
  {
    id: "surround-712",
    label: "Surround sound - 7.1 or Dolby Atmos 5.1.2",
    basePrice: 7600,
  },
  { id: "surround-92", label: "Surround sound - Dolby Atmos 9.2", basePrice: 11500 },
]

const lightingOptions: Option[] = [
  { id: "lighting-20", label: "20 or less lights, no keypads", basePrice: 4500 },
  {
    id: "lighting-50",
    label: "Partial house up to 50 loads with no switch banks in room",
    basePrice: 14000,
  },
  {
    id: "lighting-200",
    label: "Whole house up to 200 loads with premium low-voltage keypads",
    basePrice: 42000,
  },
]

const shadeStyleOptions: Option[] = [
  { id: "honeycomb", label: "Honeycomb", basePrice: 650 },
  { id: "roller", label: "Roller", basePrice: 750 },
  { id: "roman", label: "Roman", basePrice: 980 },
  { id: "drape-track", label: "Drape track", basePrice: 1400 },
]

const shadeBrandOptions: Option[] = [
  { id: "lutron", label: "Lutron", basePrice: 550 },
  { id: "conrad", label: "Conrad", basePrice: 350 },
  { id: "proseo", label: "Proseo", basePrice: 420 },
]

const automationOptions: Option[] = [
  { id: "savant-yes", label: "Yes - Savant one-app control", basePrice: 8500 },
  { id: "savant-no", label: "No - individual apps", basePrice: 0 },
]

const sectionMeta = [
  {
    id: "rooms",
    title: "Home size",
    subtitle: "Tell us how many rooms so we can pre-fill realistic starting points.",
    Icon: RiHome4Line,
  },
  {
    id: "tv",
    title: "Pre-wire & TV",
    subtitle: "Choose your media locations and system type.",
    Icon: RiTv2Line,
  },
  {
    id: "security",
    title: "Security",
    subtitle: "Alarm and surveillance options for protection.",
    Icon: RiLock2Line,
  },
  {
    id: "network",
    title: "Network",
    subtitle: "Coverage and hardwired endpoints across the home.",
    Icon: RiRouterLine,
  },
  {
    id: "audio",
    title: "House audio",
    subtitle: "Pick room audio style from stereo to Atmos.",
    Icon: RiSoundModuleLine,
  },
  {
    id: "lighting",
    title: "Automated lighting",
    subtitle: "Scale from a small setup to full-home controls.",
    Icon: RiLightbulbFlashLine,
  },
  {
    id: "shades",
    title: "Automated shades",
    subtitle: "Traditional and designer solutions indoors/outdoors.",
    Icon: RiCameraLensLine,
  },
  {
    id: "automation",
    title: "Whole-home app",
    subtitle: "Single-app experience with Savant integration.",
    Icon: RiHomeGearLine,
  },
] as const

type RoomAssumptions = {
  tvLocations: number
  wifiAccessPoints: number
  hardwiredLocations: number
  audioRooms: number
  shadeWindowCount: number
  outdoorShadeCount: number
  lightingChoice: string
}

function assumptionsFromRooms(rooms: number): RoomAssumptions {
  const r = Math.max(1, Math.round(rooms))

  const tvLocations = Math.min(r, Math.max(1, Math.round(r * 0.55)))
  const wifiAccessPoints = Math.max(1, Math.ceil(r * 0.55))
  const hardwiredLocations = Math.max(2, Math.ceil(r * 1.35))
  const audioRooms = r
  const shadeWindowCount = Math.max(r, Math.ceil(r * 2.25))
  const outdoorShadeCount = Math.max(0, Math.floor(r * 0.2))

  let lightingChoice = lightingOptions[0].id
  if (r >= 14) lightingChoice = lightingOptions[2].id
  else if (r >= 7) lightingChoice = lightingOptions[1].id

  return {
    tvLocations,
    wifiAccessPoints,
    hardwiredLocations,
    audioRooms,
    shadeWindowCount,
    outdoorShadeCount,
    lightingChoice,
  }
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function optionById(options: Option[], id: string) {
  return options.find((option) => option.id === id) ?? options[0]
}

function picsumHero(seed: string, width = 1600, height = 1000) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`
}

type HeroVisual = { src: string; alt: string }

function buildHeroVisual(args: {
  activeSectionId: string
  totalRooms: number
  tvChoice: string
  securityChoice: string
  wifiAccessPoints: number
  hardwiredLocations: number
  audioChoice: string
  lightingChoice: string
  shadeStyleChoice: string
  shadeBrandChoice: string
  outdoorShadeCount: number
  automationChoice: string
}): HeroVisual {
  const {
    activeSectionId,
    totalRooms,
    tvChoice,
    securityChoice,
    wifiAccessPoints,
    hardwiredLocations,
    audioChoice,
    lightingChoice,
    shadeStyleChoice,
    shadeBrandChoice,
    outdoorShadeCount,
    automationChoice,
  } = args

  switch (activeSectionId) {
    case "rooms": {
      const seed =
        totalRooms >= 16
          ? "av-rooms-large"
          : totalRooms >= 10
            ? "av-rooms-medium"
            : "av-rooms-cozy"
      return {
        src: picsumHero(seed),
        alt: `Residential interior concept for about ${totalRooms} rooms`,
      }
    }
    case "tv": {
      const map: Record<string, { seed: string; alt: string }> = {
        "tv-stereo": { seed: "av-tv-stereo", alt: "Living room TV with stereo speakers" },
        "tv-soundbar": { seed: "av-tv-soundbar", alt: "Slim soundbar under a wall-mounted TV" },
        "tv-surround": { seed: "av-tv-surround", alt: "Home theater with surround speakers" },
        "tv-only": { seed: "av-tv-only", alt: "Minimal TV installation without external audio" },
      }
      const picked = map[tvChoice] ?? map["tv-stereo"]
      return { src: picsumHero(picked.seed), alt: picked.alt }
    }
    case "security": {
      const map: Record<string, { seed: string; alt: string }> = {
        burglary: { seed: "av-sec-burglary", alt: "Home security keypad and sensors" },
        "burglary-fire": { seed: "av-sec-fire", alt: "Integrated burglary and fire protection" },
        surveillance: { seed: "av-sec-cameras", alt: "Outdoor security cameras and monitoring" },
      }
      const picked = map[securityChoice] ?? map.burglary
      return { src: picsumHero(picked.seed), alt: picked.alt }
    }
    case "network": {
      const density = wifiAccessPoints + hardwiredLocations
      const seed =
        density >= 18
          ? "av-net-enterprise"
          : density >= 10
            ? "av-net-large"
            : density >= 5
              ? "av-net-medium"
              : "av-net-small"
      return {
        src: picsumHero(seed),
        alt: `Network planning for ${wifiAccessPoints} WiFi access points and ${hardwiredLocations} hardwired drops`,
      }
    }
    case "audio": {
      const map: Record<string, { seed: string; alt: string }> = {
        architectural: { seed: "av-audio-arch", alt: "Architectural in-ceiling speakers" },
        "on-wall": { seed: "av-audio-onwall", alt: "On-wall speakers in a modern living space" },
        invisible: { seed: "av-audio-invisible", alt: "Minimalist room with hidden audio" },
        "surround-51": { seed: "av-audio-51", alt: "Surround sound speaker layout" },
        "surround-712": { seed: "av-audio-atmos", alt: "Immersive Dolby Atmos style layout" },
        "surround-92": { seed: "av-audio-92", alt: "Large-format immersive theater audio" },
      }
      const picked = map[audioChoice] ?? map.architectural
      return { src: picsumHero(picked.seed), alt: picked.alt }
    }
    case "lighting": {
      const map: Record<string, { seed: string; alt: string }> = {
        "lighting-20": { seed: "av-light-small", alt: "Warm residential lighting accents" },
        "lighting-50": { seed: "av-light-partial", alt: "Layered lighting across multiple rooms" },
        "lighting-200": { seed: "av-light-whole", alt: "Whole-home lighting control concept" },
      }
      const picked = map[lightingChoice] ?? map["lighting-20"]
      return { src: picsumHero(picked.seed), alt: picked.alt }
    }
    case "shades": {
      const seed = `av-shade-${shadeStyleChoice}-${shadeBrandChoice}-out${Math.min(outdoorShadeCount, 9)}`
      return {
        src: picsumHero(seed),
        alt: `Shades: ${shadeStyleChoice} style with ${shadeBrandChoice} designer option${
          outdoorShadeCount > 0 ? ", including outdoor shading" : ""
        }`,
      }
    }
    case "automation": {
      const map: Record<string, { seed: string; alt: string }> = {
        "savant-yes": { seed: "av-auto-unified", alt: "Unified smart home control on one device" },
        "savant-no": { seed: "av-auto-apps", alt: "Multiple smart home apps on a phone" },
      }
      const picked = map[automationChoice] ?? map["savant-yes"]
      return { src: picsumHero(picked.seed), alt: picked.alt }
    }
    default: {
      return {
        src: "/apple-checkout-reference.png",
        alt: "Apple-style checkout inspiration",
      }
    }
  }
}

type OptionCardProps = {
  selected: boolean
  label: string
  priceText: string
  onClick: () => void
}

function OptionCard({ selected, label, priceText, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all ${
        selected
          ? "border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.25)]"
          : "border-border hover:border-primary/45"
      }`}
    >
      <p className="text-sm font-medium leading-snug">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{priceText}</p>
    </button>
  )
}

type QuantityInputProps = {
  label: string
  value: number
  min: number
  onChange: (value: number) => void
}

function QuantityInput({ label, value, min, onChange }: QuantityInputProps) {
  return (
    <label className="space-y-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(Math.max(min, Number(event.target.value) || min))}
        className="w-full rounded-lg border bg-background px-3 py-2"
      />
    </label>
  )
}

export default function Page() {
  const startingRooms = 10
  const startingAssumptions = assumptionsFromRooms(startingRooms)

  const [totalRooms, setTotalRooms] = useState(startingRooms)
  const [tvChoice, setTvChoice] = useState(tvOptions[0].id)
  const [tvLocations, setTvLocations] = useState(startingAssumptions.tvLocations)
  const [securityChoice, setSecurityChoice] = useState(securityOptions[1].id)
  const [wifiAccessPoints, setWifiAccessPoints] = useState(startingAssumptions.wifiAccessPoints)
  const [hardwiredLocations, setHardwiredLocations] = useState(
    startingAssumptions.hardwiredLocations
  )
  const [audioChoice, setAudioChoice] = useState(houseAudioOptions[0].id)
  const [audioRooms, setAudioRooms] = useState(startingAssumptions.audioRooms)
  const [lightingChoice, setLightingChoice] = useState(startingAssumptions.lightingChoice)
  const [shadeStyleChoice, setShadeStyleChoice] = useState(shadeStyleOptions[1].id)
  const [shadeBrandChoice, setShadeBrandChoice] = useState(shadeBrandOptions[0].id)
  const [shadeWindowCount, setShadeWindowCount] = useState(startingAssumptions.shadeWindowCount)
  const [outdoorShadeCount, setOutdoorShadeCount] = useState(
    startingAssumptions.outdoorShadeCount
  )
  const [automationChoice, setAutomationChoice] = useState(automationOptions[0].id)
  const [activeSectionId, setActiveSectionId] = useState(sectionMeta[0].id)
  const [assumptionsOpen, setAssumptionsOpen] = useState(false)
  const assumptionsPanelId = useId()

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const roomAssumptions = useMemo(() => assumptionsFromRooms(totalRooms), [totalRooms])

  const applyAssumptionsFromRooms = (roomsCount: number) => {
    const next = assumptionsFromRooms(roomsCount)
    setTvLocations(next.tvLocations)
    setWifiAccessPoints(next.wifiAccessPoints)
    setHardwiredLocations(next.hardwiredLocations)
    setAudioRooms(next.audioRooms)
    setShadeWindowCount(next.shadeWindowCount)
    setOutdoorShadeCount(next.outdoorShadeCount)
    setLightingChoice(next.lightingChoice)
  }

  const summary = useMemo(() => {
    const tv = optionById(tvOptions, tvChoice)
    const security = optionById(securityOptions, securityChoice)
    const audio = optionById(houseAudioOptions, audioChoice)
    const lighting = optionById(lightingOptions, lightingChoice)
    const shadeStyle = optionById(shadeStyleOptions, shadeStyleChoice)
    const shadeBrand = optionById(shadeBrandOptions, shadeBrandChoice)
    const automation = optionById(automationOptions, automationChoice)

    const items = [
      { label: `${tv.label} x ${tvLocations}`, total: tv.basePrice * tvLocations },
      { label: security.label, total: security.basePrice },
      { label: `WiFi access points x ${wifiAccessPoints}`, total: wifiAccessPoints * 400 },
      { label: `Hardwired locations x ${hardwiredLocations}`, total: hardwiredLocations * 250 },
      { label: `${audio.label} x ${audioRooms} rooms`, total: audio.basePrice * audioRooms },
      { label: lighting.label, total: lighting.basePrice },
      {
        label: `${shadeStyle.label} + ${shadeBrand.label} x ${shadeWindowCount} windows`,
        total: (shadeStyle.basePrice + shadeBrand.basePrice) * shadeWindowCount,
      },
      { label: `Insolroll outdoor shades x ${outdoorShadeCount}`, total: outdoorShadeCount * 1800 },
      { label: automation.label, total: automation.basePrice },
    ]

    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const designEngineering = Math.round(subtotal * 0.08)
    const installProgramming = Math.round(subtotal * 0.12)
    const total = subtotal + designEngineering + installProgramming

    return {
      items,
      subtotal,
      designEngineering,
      installProgramming,
      total,
      monthlyLow: Math.round(total / 48),
      monthlyHigh: Math.round(total / 36),
    }
  }, [
    tvChoice,
    tvLocations,
    securityChoice,
    wifiAccessPoints,
    hardwiredLocations,
    audioChoice,
    audioRooms,
    lightingChoice,
    shadeStyleChoice,
    shadeBrandChoice,
    shadeWindowCount,
    outdoorShadeCount,
    automationChoice,
  ])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) {
          setActiveSectionId(visible.target.id)
        }
      },
      { threshold: [0.35, 0.55, 0.75], rootMargin: "-20% 0px -40% 0px" }
    )

    for (const section of sectionMeta) {
      const element = sectionRefs.current[section.id]
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [])

  const activeSectionIndex = sectionMeta.findIndex((section) => section.id === activeSectionId)
  const activeSection = sectionMeta[Math.max(0, activeSectionIndex)]

  const goToSection = (sectionId: string) => {
    sectionRefs.current[sectionId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  const goNext = () => {
    const next = sectionMeta[activeSectionIndex + 1]
    if (next) goToSection(next.id)
  }

  const heroVisual = useMemo(
    () =>
      buildHeroVisual({
        activeSectionId,
        totalRooms,
        tvChoice,
        securityChoice,
        wifiAccessPoints,
        hardwiredLocations,
        audioChoice,
        lightingChoice,
        shadeStyleChoice,
        shadeBrandChoice,
        outdoorShadeCount,
        automationChoice,
      }),
    [
      activeSectionId,
      totalRooms,
      tvChoice,
      securityChoice,
      wifiAccessPoints,
      hardwiredLocations,
      audioChoice,
      lightingChoice,
      shadeStyleChoice,
      shadeBrandChoice,
      outdoorShadeCount,
      automationChoice,
    ]
  )

  return (
    <main className="min-h-svh bg-background px-4 pb-14 pt-6 text-foreground md:px-8 lg:px-10">
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-6 overflow-hidden rounded-3xl border bg-card">
            <div className="relative h-[82vh] min-h-[700px]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={heroVisual.src}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={heroVisual.src}
                    alt={heroVisual.alt}
                    fill
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    priority={activeSectionId === sectionMeta[0].id}
                    className="object-cover object-left"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/55 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="rounded-2xl border bg-card/90 p-5 backdrop-blur"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <activeSection.Icon className="size-5 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Step {activeSectionIndex + 1} of {sectionMeta.length}
                      </p>
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight">{activeSection.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{activeSection.subtitle}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Current estimate</p>
                        <p className="text-2xl font-semibold">{money(summary.total)}</p>
                      </div>
                      <Button onClick={goNext} disabled={activeSectionIndex === sectionMeta.length - 1}>
                        Next <RiArrowRightLine className="ml-1 size-4" />
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-10 md:space-y-12">
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-2"
          >
            <p className="text-sm text-muted-foreground">AV App Budgeting Menu</p>
            <h1 className="text-3xl font-semibold tracking-tight">A guided AV planning experience</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Start with room count, then scroll section by section. Counts pre-fill from your room
              total so you can refine instead of starting from zero.
            </p>
          </motion.header>

          <div className="sticky top-2 z-20 rounded-2xl border bg-background/95 px-2 py-2 backdrop-blur sm:px-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="shrink-0 text-xs text-muted-foreground">
                Step {activeSectionIndex + 1} / {sectionMeta.length}
              </div>

              <div className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max items-center justify-center gap-1.5 sm:gap-2">
                  {sectionMeta.map((section) => {
                    const isActive = section.id === activeSectionId
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => goToSection(section.id)}
                        className={`shrink-0 rounded-lg px-2 py-1.5 text-xs transition ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/70"
                        }`}
                      >
                        <section.Icon className="mx-auto size-4" />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="shrink-0 text-xs font-medium tabular-nums text-foreground">
                {money(summary.total)}
              </div>
            </div>
          </div>

          <motion.article
            id="rooms"
            ref={(node) => {
              sectionRefs.current.rooms = node
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            className="space-y-5 rounded-3xl border bg-card p-5 md:p-6"
          >
            <h2 className="flex items-center gap-2 text-xl font-medium">
              <RiHome4Line className="size-5 text-primary" /> How many rooms?
            </h2>
            <p className="text-sm text-muted-foreground">
              Rooms include bedrooms, living spaces, offices, and meaningful exterior zones you want
              treated like a room for audio or controls.
            </p>
            <QuantityInput
              label="Total rooms"
              value={totalRooms}
              min={1}
              onChange={(nextRooms) => {
                setTotalRooms(nextRooms)
                applyAssumptionsFromRooms(nextRooms)
              }}
            />
            <div className="mt-8 overflow-hidden rounded-2xl border bg-muted/30 md:mt-10">
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left text-sm text-muted-foreground transition hover:bg-muted/40"
                aria-expanded={assumptionsOpen}
                aria-controls={assumptionsPanelId}
                onClick={() => setAssumptionsOpen((open) => !open)}
              >
                <span>
                  <span className="block font-medium text-foreground">
                    Starting assumptions from {totalRooms} rooms
                  </span>
                  <span className="mt-1 block text-xs">
                    {assumptionsOpen ? "Hide details" : "Show what we prefilled from your room count"}
                  </span>
                </span>
                <RiArrowDownSLine
                  className={`mt-0.5 size-5 shrink-0 text-foreground transition-transform ${
                    assumptionsOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              <div
                className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
                  assumptionsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div id={assumptionsPanelId} className="min-h-0">
                  <div className="space-y-3 px-4 pb-4 text-sm text-muted-foreground">
                    <ul className="list-disc space-y-1 pl-5">
                      <li>TV locations: {roomAssumptions.tvLocations}</li>
                      <li>WiFi access points: {roomAssumptions.wifiAccessPoints}</li>
                      <li>Hardwired drops: {roomAssumptions.hardwiredLocations}</li>
                      <li>Audio rooms: {roomAssumptions.audioRooms}</li>
                      <li>Shade windows: {roomAssumptions.shadeWindowCount}</li>
                      <li>Outdoor shades: {roomAssumptions.outdoorShadeCount}</li>
                      <li>
                        Lighting tier: {optionById(lightingOptions, roomAssumptions.lightingChoice).label}
                      </li>
                    </ul>
                    <p className="text-xs">
                      Change the room count anytime; we refresh the starting counts so you can keep
                      tuning downstream sections.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.article>

          <motion.article
            id="tv"
            ref={(node) => {
              sectionRefs.current.tv = node
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            className="space-y-5 rounded-3xl border bg-card p-5 md:p-6"
          >
            <h2 className="flex items-center gap-2 text-xl font-medium">
              <RiTv2Line className="size-5 text-primary" /> Pre-wire: TV locations
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {tvOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  selected={tvChoice === option.id}
                  onClick={() => setTvChoice(option.id)}
                  label={option.label}
                  priceText={`${money(option.basePrice)} each`}
                />
              ))}
            </div>
            <QuantityInput
              label="TV location count"
              value={tvLocations}
              min={1}
              onChange={setTvLocations}
            />
          </motion.article>

          <motion.article
            id="security"
            ref={(node) => {
              sectionRefs.current.security = node
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            className="space-y-5 rounded-3xl border bg-card p-5 md:p-6"
          >
            <h2 className="flex items-center gap-2 text-xl font-medium">
              <RiLock2Line className="size-5 text-primary" /> Security - Alarm & surveillance
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {securityOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  selected={securityChoice === option.id}
                  onClick={() => setSecurityChoice(option.id)}
                  label={option.label}
                  priceText={`From ${money(option.basePrice)}`}
                />
              ))}
            </div>
          </motion.article>

          <motion.article
            id="network"
            ref={(node) => {
              sectionRefs.current.network = node
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            className="space-y-5 rounded-3xl border bg-card p-5 md:p-6"
          >
            <h2 className="flex items-center gap-2 text-xl font-medium">
              <RiRouterLine className="size-5 text-primary" /> Network
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <QuantityInput
                label="WiFi access point locations"
                value={wifiAccessPoints}
                min={0}
                onChange={setWifiAccessPoints}
              />
              <QuantityInput
                label="Hardwired locations"
                value={hardwiredLocations}
                min={0}
                onChange={setHardwiredLocations}
              />
            </div>
          </motion.article>

          <motion.article
            id="audio"
            ref={(node) => {
              sectionRefs.current.audio = node
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            className="space-y-5 rounded-3xl border bg-card p-5 md:p-6"
          >
            <h2 className="flex items-center gap-2 text-xl font-medium">
              <RiSoundModuleLine className="size-5 text-primary" /> House audio
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {houseAudioOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  selected={audioChoice === option.id}
                  onClick={() => setAudioChoice(option.id)}
                  label={option.label}
                  priceText={`From ${money(option.basePrice)} / room`}
                />
              ))}
            </div>
            <QuantityInput
              label="Room count (interior + exterior)"
              value={audioRooms}
              min={0}
              onChange={setAudioRooms}
            />
          </motion.article>

          <motion.article
            id="lighting"
            ref={(node) => {
              sectionRefs.current.lighting = node
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            className="space-y-5 rounded-3xl border bg-card p-5 md:p-6"
          >
            <h2 className="flex items-center gap-2 text-xl font-medium">
              <RiLightbulbFlashLine className="size-5 text-primary" /> Automated lighting
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {lightingOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  selected={lightingChoice === option.id}
                  onClick={() => setLightingChoice(option.id)}
                  label={option.label}
                  priceText={`From ${money(option.basePrice)}`}
                />
              ))}
            </div>
          </motion.article>

          <motion.article
            id="shades"
            ref={(node) => {
              sectionRefs.current.shades = node
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            className="space-y-5 rounded-3xl border bg-card p-5 md:p-6"
          >
            <h2 className="flex items-center gap-2 text-xl font-medium">
              <RiCameraLensLine className="size-5 text-primary" /> Automated shades
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {shadeStyleOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  selected={shadeStyleChoice === option.id}
                  onClick={() => setShadeStyleChoice(option.id)}
                  label={option.label}
                  priceText={`${money(option.basePrice)} base`}
                />
              ))}
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Designer option</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {shadeBrandOptions.map((option) => (
                  <OptionCard
                    key={option.id}
                    selected={shadeBrandChoice === option.id}
                    onClick={() => setShadeBrandChoice(option.id)}
                    label={option.label}
                    priceText={`${money(option.basePrice)} premium`}
                  />
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <QuantityInput
                label="Window count"
                value={shadeWindowCount}
                min={0}
                onChange={setShadeWindowCount}
              />
              <QuantityInput
                label="Outdoor shades / insect screens (Insolroll)"
                value={outdoorShadeCount}
                min={0}
                onChange={setOutdoorShadeCount}
              />
            </div>
          </motion.article>

          <motion.article
            id="automation"
            ref={(node) => {
              sectionRefs.current.automation = node
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            className="space-y-5 rounded-3xl border bg-card p-5 md:p-6"
          >
            <h2 className="flex items-center gap-2 text-xl font-medium">
              <RiHomeGearLine className="size-5 text-primary" /> Whole home automation
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {automationOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  selected={automationChoice === option.id}
                  onClick={() => setAutomationChoice(option.id)}
                  label={option.label}
                  priceText={option.basePrice ? `From ${money(option.basePrice)}` : "Included"}
                />
              ))}
            </div>
          </motion.article>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            className="rounded-3xl border bg-card p-5 md:p-6"
          >
            <p className="text-sm text-muted-foreground">Estimated investment</p>
            <h3 className="mt-1 text-3xl font-semibold">{money(summary.total)}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {money(summary.monthlyLow)} - {money(summary.monthlyHigh)} / month
            </p>

            <div className="mt-4 space-y-2 border-t pt-4">
              {summary.items.map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-3 text-sm">
                  <p className="text-muted-foreground">{item.label}</p>
                  <p className="whitespace-nowrap font-medium">{money(item.total)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{money(summary.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Design + engineering (8%)</span>
                <span>{money(summary.designEngineering)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Install + programming (12%)</span>
                <span>{money(summary.installProgramming)}</span>
              </div>
            </div>

            <Button className="mt-5 w-full">
              Request detailed proposal <RiArrowRightLine className="ml-1 size-4" />
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Budgetary estimate only. Final pricing depends on site walk, brand selection, and
              scope details.
            </p>
          </motion.div>

          <button
            type="button"
            onClick={() => goToSection(sectionMeta[0].id)}
            className="mx-auto flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
          >
            Back to top <RiArrowDownSLine className="size-4 rotate-180" />
          </button>
        </section>
      </div>
    </main>
  )
}

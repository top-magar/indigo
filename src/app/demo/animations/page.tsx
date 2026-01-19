"use client"

import { useState } from "react"
import {
  // Animated Icons
  AnimatedCheck,
  AnimatedX,
  AnimatedArrow,
  AnimatedPlusMinus,
  AnimatedHamburger,
  AnimatedChevron,
  AnimatedHeart,
  AnimatedStar,
  AnimatedBell,
  AnimatedCopy,
  AnimatedSpinner,
  AnimatedSuccess,
  AnimatedError,
  AnimatedBookmark,
  AnimatedTrash,
  // Animated Components
  AnimatedButton,
  AnimatedIconButton,
  AnimatedCard,
  AnimatedBadge,
  NotificationDot,
  AnimatedCheckbox,
  AnimatedToggle,
  AnimatedInput,
  // Animation Wrappers
  HoverScale,
  TapBounce,
  StaggerList,
  StaggerItem,
  Magnetic,
  TiltCard,
  // Utility Hooks
  usePlayfulAnimation,
  useIconAnimation,
} from "@/components/ui/animated"
import { motion } from "framer-motion"
import { Settings, RefreshCw, Star, Heart, Bell, PanelLeft } from "lucide-react"
import Link from "next/link"
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { SidebarClient } from "@/components/dashboard/sidebar/sidebar-client"
import { Button } from "@/components/ui/button"

// =============================================================================
// DEMO SECTION COMPONENT
// =============================================================================

function DemoSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--ds-gray-900)]">{title}</h2>
        <p className="text-sm text-[var(--ds-gray-600)]">{description}</p>
      </div>
      <div className="rounded-lg border border-[var(--ds-gray-200)] bg-white p-6">
        {children}
      </div>
    </section>
  )
}

// =============================================================================
// DEMO CARD COMPONENT
// =============================================================================

function DemoCard({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-16 items-center justify-center">{children}</div>
      <span className="text-xs font-medium text-[var(--ds-gray-600)]">{label}</span>
    </div>
  )
}

// =============================================================================
// ANIMATED ICONS DEMO
// =============================================================================

function AnimatedIconsDemo() {
  const [checkAnimate, setCheckAnimate] = useState(true)
  const [arrowDirection, setArrowDirection] = useState<"up" | "down" | "left" | "right">("right")
  const [isPlus, setIsPlus] = useState(true)
  const [hamburgerOpen, setHamburgerOpen] = useState(false)
  const [chevronOpen, setChevronOpen] = useState(false)
  const [heartFilled, setHeartFilled] = useState(false)
  const [starFilled, setStarFilled] = useState(false)
  const [bellNotification, setBellNotification] = useState(false)
  const [bellRing, setBellRing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [bookmarkFilled, setBookmarkFilled] = useState(false)
  const [trashShake, setTrashShake] = useState(false)

  return (
    <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      <DemoCard label="AnimatedCheck">
        <button
          onClick={() => setCheckAnimate(!checkAnimate)}
          className="rounded-md p-2 hover:bg-[var(--ds-gray-100)]"
        >
          <AnimatedCheck key={String(checkAnimate)} size={24} animate={checkAnimate} />
        </button>
      </DemoCard>

      <DemoCard label="AnimatedX">
        <button className="rounded-md p-2 hover:bg-[var(--ds-gray-100)]">
          <AnimatedX size={24} />
        </button>
      </DemoCard>

      <DemoCard label="AnimatedArrow">
        <button
          onClick={() => {
            const directions: ("up" | "down" | "left" | "right")[] = ["right", "down", "left", "up"]
            const currentIndex = directions.indexOf(arrowDirection)
            setArrowDirection(directions[(currentIndex + 1) % 4])
          }}
          className="rounded-md p-2 hover:bg-[var(--ds-gray-100)]"
        >
          <AnimatedArrow size={24} direction={arrowDirection} />
        </button>
      </DemoCard>

      <DemoCard label="AnimatedPlusMinus">
        <button
          onClick={() => setIsPlus(!isPlus)}
          className="rounded-md p-2 hover:bg-[var(--ds-gray-100)]"
        >
          <AnimatedPlusMinus size={24} isPlus={isPlus} />
        </button>
      </DemoCard>

      <DemoCard label="AnimatedHamburger">
        <button
          onClick={() => setHamburgerOpen(!hamburgerOpen)}
          className="rounded-md p-2 hover:bg-[var(--ds-gray-100)]"
        >
          <AnimatedHamburger size={24} isOpen={hamburgerOpen} />
        </button>
      </DemoCard>

      <DemoCard label="AnimatedChevron">
        <button
          onClick={() => setChevronOpen(!chevronOpen)}
          className="rounded-md p-2 hover:bg-[var(--ds-gray-100)]"
        >
          <AnimatedChevron size={24} isOpen={chevronOpen} />
        </button>
      </DemoCard>

      <DemoCard label="AnimatedHeart">
        <button
          onClick={() => setHeartFilled(!heartFilled)}
          className="rounded-md p-2 text-[var(--ds-red-500)] hover:bg-[var(--ds-gray-100)]"
        >
          <AnimatedHeart size={24} filled={heartFilled} />
        </button>
      </DemoCard>

      <DemoCard label="AnimatedStar">
        <button
          onClick={() => setStarFilled(!starFilled)}
          className="rounded-md p-2 text-[var(--ds-amber-500)] hover:bg-[var(--ds-gray-100)]"
        >
          <AnimatedStar size={24} filled={starFilled} />
        </button>
      </DemoCard>

      <DemoCard label="AnimatedBell">
        <button
          onClick={() => {
            setBellNotification(!bellNotification)
            setBellRing(true)
            setTimeout(() => setBellRing(false), 500)
          }}
          className="rounded-md p-2 hover:bg-[var(--ds-gray-100)]"
        >
          <AnimatedBell size={24} hasNotification={bellNotification} ring={bellRing} />
        </button>
      </DemoCard>

      <DemoCard label="AnimatedCopy">
        <button
          onClick={() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="rounded-md p-2 hover:bg-[var(--ds-gray-100)]"
        >
          <AnimatedCopy size={24} copied={copied} />
        </button>
      </DemoCard>

      <DemoCard label="AnimatedSpinner">
        <div className="rounded-md p-2">
          <AnimatedSpinner size={24} />
        </div>
      </DemoCard>

      <DemoCard label="AnimatedSuccess">
        <AnimatedSuccess size={32} />
      </DemoCard>

      <DemoCard label="AnimatedError">
        <AnimatedError size={32} />
      </DemoCard>

      <DemoCard label="AnimatedBookmark">
        <button
          onClick={() => setBookmarkFilled(!bookmarkFilled)}
          className="rounded-md p-2 text-[var(--ds-blue-500)] hover:bg-[var(--ds-gray-100)]"
        >
          <AnimatedBookmark size={24} filled={bookmarkFilled} />
        </button>
      </DemoCard>

      <DemoCard label="AnimatedTrash">
        <button
          onClick={() => {
            setTrashShake(true)
            setTimeout(() => setTrashShake(false), 500)
          }}
          className="rounded-md p-2 text-[var(--ds-red-500)] hover:bg-[var(--ds-gray-100)]"
        >
          <AnimatedTrash size={24} shake={trashShake} />
        </button>
      </DemoCard>
    </div>
  )
}

// =============================================================================
// ANIMATED BUTTONS DEMO
// =============================================================================

function AnimatedButtonsDemo() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--ds-gray-900)]">AnimatedButton Variants</h3>
        <div className="flex flex-wrap gap-3">
          <AnimatedButton variant="default">Default</AnimatedButton>
          <AnimatedButton variant="bounce">Bounce</AnimatedButton>
          <AnimatedButton variant="pulse">Pulse</AnimatedButton>
          <AnimatedButton variant="glow">Glow</AnimatedButton>
          <AnimatedButton variant="shake">Shake</AnimatedButton>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--ds-gray-900)]">AnimatedIconButton Variants</h3>
        <div className="flex flex-wrap gap-3">
          <AnimatedIconButton variant="default">
            <Settings className="h-4 w-4" />
          </AnimatedIconButton>
          <AnimatedIconButton variant="spin">
            <RefreshCw className="h-4 w-4" />
          </AnimatedIconButton>
          <AnimatedIconButton variant="bounce">
            <Star className="h-4 w-4" />
          </AnimatedIconButton>
          <AnimatedIconButton variant="wiggle">
            <Bell className="h-4 w-4" />
          </AnimatedIconButton>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// ANIMATED CARDS DEMO
// =============================================================================

function AnimatedCardsDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <AnimatedCard variant="lift">
        <h4 className="text-sm font-medium text-[var(--ds-gray-900)]">Lift</h4>
        <p className="text-xs text-[var(--ds-gray-600)]">Hover to lift up</p>
      </AnimatedCard>
      <AnimatedCard variant="scale">
        <h4 className="text-sm font-medium text-[var(--ds-gray-900)]">Scale</h4>
        <p className="text-xs text-[var(--ds-gray-600)]">Hover to scale</p>
      </AnimatedCard>
      <AnimatedCard variant="glow">
        <h4 className="text-sm font-medium text-[var(--ds-gray-900)]">Glow</h4>
        <p className="text-xs text-[var(--ds-gray-600)]">Hover for glow</p>
      </AnimatedCard>
      <AnimatedCard variant="border">
        <h4 className="text-sm font-medium text-[var(--ds-gray-900)]">Border</h4>
        <p className="text-xs text-[var(--ds-gray-600)]">Hover for border</p>
      </AnimatedCard>
      <AnimatedCard variant="tilt">
        <h4 className="text-sm font-medium text-[var(--ds-gray-900)]">Tilt</h4>
        <p className="text-xs text-[var(--ds-gray-600)]">Hover to tilt</p>
      </AnimatedCard>
    </div>
  )
}

// =============================================================================
// ANIMATED BADGES DEMO
// =============================================================================

function AnimatedBadgesDemo() {
  const [notificationCount, setNotificationCount] = useState(5)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--ds-gray-900)]">Badge Variants</h3>
        <div className="flex flex-wrap gap-3">
          <AnimatedBadge variant="default">Default</AnimatedBadge>
          <AnimatedBadge variant="success">Success</AnimatedBadge>
          <AnimatedBadge variant="warning">Warning</AnimatedBadge>
          <AnimatedBadge variant="error">Error</AnimatedBadge>
          <AnimatedBadge variant="info">Info</AnimatedBadge>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--ds-gray-900)]">With Pulse Animation</h3>
        <div className="flex flex-wrap gap-3">
          <AnimatedBadge variant="success" pulse>Live</AnimatedBadge>
          <AnimatedBadge variant="error" pulse>Recording</AnimatedBadge>
          <AnimatedBadge variant="info" pulse>Syncing</AnimatedBadge>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--ds-gray-900)]">NotificationDot</h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            <button className="h-10 w-10 rounded-md bg-[var(--ds-gray-100)] flex items-center justify-center">
              <Bell className="h-5 w-5 text-[var(--ds-gray-600)]" />
            </button>
            <NotificationDot count={notificationCount} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setNotificationCount(Math.max(0, notificationCount - 1))}
              className="h-8 px-3 rounded-md border border-[var(--ds-gray-300)] text-sm"
            >
              −
            </button>
            <button
              onClick={() => setNotificationCount(notificationCount + 1)}
              className="h-8 px-3 rounded-md border border-[var(--ds-gray-300)] text-sm"
            >
              +
            </button>
          </div>
          <span className="text-sm text-[var(--ds-gray-600)]">Count: {notificationCount}</span>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// FORM COMPONENTS DEMO
// =============================================================================

function FormComponentsDemo() {
  const [checkbox1, setCheckbox1] = useState(false)
  const [checkbox2, setCheckbox2] = useState(true)
  const [toggle1, setToggle1] = useState(false)
  const [toggle2, setToggle2] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [inputError, setInputError] = useState("")
  const [inputSuccess, setInputSuccess] = useState(false)

  const validateInput = (value: string) => {
    setInputValue(value)
    if (value.length === 0) {
      setInputError("")
      setInputSuccess(false)
    } else if (value.length < 3) {
      setInputError("Must be at least 3 characters")
      setInputSuccess(false)
    } else {
      setInputError("")
      setInputSuccess(true)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--ds-gray-900)]">AnimatedCheckbox</h3>
        <div className="flex gap-6">
          <AnimatedCheckbox
            checked={checkbox1}
            onChange={setCheckbox1}
            label="Unchecked by default"
          />
          <AnimatedCheckbox
            checked={checkbox2}
            onChange={setCheckbox2}
            label="Checked by default"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--ds-gray-900)]">AnimatedToggle</h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <AnimatedToggle size="sm" checked={toggle1} onChange={setToggle1} />
            <span className="text-sm text-[var(--ds-gray-600)]">Small</span>
          </div>
          <div className="flex items-center gap-2">
            <AnimatedToggle size="md" checked={toggle2} onChange={setToggle2} />
            <span className="text-sm text-[var(--ds-gray-600)]">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <AnimatedToggle size="lg" checked={toggle1} onChange={setToggle1} />
            <span className="text-sm text-[var(--ds-gray-600)]">Large</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--ds-gray-900)]">AnimatedInput</h3>
        <div className="max-w-sm">
          <AnimatedInput
            label="Username"
            placeholder="Enter at least 3 characters…"
            value={inputValue}
            onChange={(e) => validateInput(e.target.value)}
            error={inputError}
            success={inputSuccess}
          />
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// ANIMATION WRAPPERS DEMO
// =============================================================================

function AnimationWrappersDemo() {
  const [staggerKey, setStaggerKey] = useState(0)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--ds-gray-900)]">HoverScale</h3>
        <div className="flex gap-4">
          <HoverScale scale={1.05}>
            <div className="h-20 w-20 rounded-lg bg-[var(--ds-gray-100)] flex items-center justify-center">
              <span className="text-xs text-[var(--ds-gray-600)]">1.05x</span>
            </div>
          </HoverScale>
          <HoverScale scale={1.1}>
            <div className="h-20 w-20 rounded-lg bg-[var(--ds-gray-100)] flex items-center justify-center">
              <span className="text-xs text-[var(--ds-gray-600)]">1.1x</span>
            </div>
          </HoverScale>
          <HoverScale scale={1.15}>
            <div className="h-20 w-20 rounded-lg bg-[var(--ds-gray-100)] flex items-center justify-center">
              <span className="text-xs text-[var(--ds-gray-600)]">1.15x</span>
            </div>
          </HoverScale>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--ds-gray-900)]">TapBounce</h3>
        <div className="flex gap-4">
          <TapBounce bounceScale={0.9}>
            <div className="h-20 w-20 rounded-lg bg-[var(--ds-blue-100)] flex items-center justify-center cursor-pointer">
              <span className="text-xs text-[var(--ds-blue-700)]">0.9x</span>
            </div>
          </TapBounce>
          <TapBounce bounceScale={0.95}>
            <div className="h-20 w-20 rounded-lg bg-[var(--ds-blue-100)] flex items-center justify-center cursor-pointer">
              <span className="text-xs text-[var(--ds-blue-700)]">0.95x</span>
            </div>
          </TapBounce>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--ds-gray-900)]">StaggerList</h3>
        <div className="flex items-start gap-4">
          <StaggerList key={staggerKey} className="w-48">
            {["Item 1", "Item 2", "Item 3", "Item 4"].map((item) => (
              <StaggerItem key={item}>
                <div className="rounded-md bg-[var(--ds-gray-100)] px-3 py-2 text-sm">
                  {item}
                </div>
              </StaggerItem>
            ))}
          </StaggerList>
          <button
            onClick={() => setStaggerKey((k) => k + 1)}
            className="h-8 px-3 rounded-md border border-[var(--ds-gray-300)] text-sm"
          >
            Replay
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--ds-gray-900)]">Magnetic</h3>
        <div className="flex gap-6">
          <Magnetic strength={0.3}>
            <div className="h-16 w-16 rounded-full bg-[var(--ds-gray-900)] flex items-center justify-center cursor-pointer">
              <Heart className="h-6 w-6 text-white" />
            </div>
          </Magnetic>
          <Magnetic strength={0.5}>
            <div className="h-16 w-16 rounded-full bg-[var(--ds-blue-600)] flex items-center justify-center cursor-pointer">
              <Star className="h-6 w-6 text-white" />
            </div>
          </Magnetic>
        </div>
        <p className="mt-2 text-xs text-[var(--ds-gray-500)]">Move your cursor near the elements</p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--ds-gray-900)]">TiltCard</h3>
        <div className="flex gap-4">
          <TiltCard maxTilt={10} className="w-40">
            <h4 className="text-sm font-medium text-[var(--ds-gray-900)]">10° Tilt</h4>
            <p className="text-xs text-[var(--ds-gray-600)]">Move cursor over card</p>
          </TiltCard>
          <TiltCard maxTilt={20} className="w-40">
            <h4 className="text-sm font-medium text-[var(--ds-gray-900)]">20° Tilt</h4>
            <p className="text-xs text-[var(--ds-gray-600)]">More dramatic effect</p>
          </TiltCard>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// UTILITY HOOKS DEMO
// =============================================================================

function UtilityHooksDemo() {
  const bounceAnimation = usePlayfulAnimation("bounce")
  const springAnimation = usePlayfulAnimation("spring")
  const gentleAnimation = usePlayfulAnimation("gentle")
  const snappyAnimation = usePlayfulAnimation("snappy")

  const spinIcon = useIconAnimation("spin")
  const bounceIcon = useIconAnimation("bounce")
  const wiggleIcon = useIconAnimation("wiggle")

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--ds-gray-900)]">usePlayfulAnimation Presets</h3>
        <div className="flex flex-wrap gap-3">
          <motion.button
            className="h-10 px-4 rounded-md bg-[var(--ds-gray-100)] text-sm font-medium"
            {...bounceAnimation}
          >
            Bounce
          </motion.button>
          <motion.button
            className="h-10 px-4 rounded-md bg-[var(--ds-gray-100)] text-sm font-medium"
            {...springAnimation}
          >
            Spring
          </motion.button>
          <motion.button
            className="h-10 px-4 rounded-md bg-[var(--ds-gray-100)] text-sm font-medium"
            {...gentleAnimation}
          >
            Gentle
          </motion.button>
          <motion.button
            className="h-10 px-4 rounded-md bg-[var(--ds-gray-100)] text-sm font-medium"
            {...snappyAnimation}
          >
            Snappy
          </motion.button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--ds-gray-900)]">useIconAnimation Variants</h3>
        <div className="flex gap-4">
          <motion.button
            className="h-10 w-10 rounded-md bg-[var(--ds-gray-100)] flex items-center justify-center"
            {...spinIcon}
          >
            <RefreshCw className="h-5 w-5 text-[var(--ds-gray-600)]" />
          </motion.button>
          <motion.button
            className="h-10 w-10 rounded-md bg-[var(--ds-gray-100)] flex items-center justify-center"
            {...bounceIcon}
          >
            <Star className="h-5 w-5 text-[var(--ds-gray-600)]" />
          </motion.button>
          <motion.button
            className="h-10 w-10 rounded-md bg-[var(--ds-gray-100)] flex items-center justify-center"
            {...wiggleIcon}
          >
            <Bell className="h-5 w-5 text-[var(--ds-gray-600)]" />
          </motion.button>
        </div>
        <p className="mt-2 text-xs text-[var(--ds-gray-500)]">
          These hooks respect <code className="text-[var(--ds-gray-700)]">prefers-reduced-motion</code>
        </p>
      </div>
    </div>
  )
}

// =============================================================================
// SIDEBAR DEMO
// =============================================================================

function SidebarDemo() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--ds-gray-600)]">
        The sidebar below is a live demo. Use the toggle button or press <kbd className="rounded bg-[var(--ds-gray-200)] px-1.5 py-0.5 text-xs font-mono">⌘B</kbd> to collapse/expand.
      </p>
      <div className="h-[600px] rounded-lg border border-[var(--ds-gray-200)] overflow-hidden">
        <SidebarProvider defaultOpen={true}>
          <div className="flex h-full w-full">
            <Sidebar collapsible="icon" className="border-r border-[var(--ds-gray-200)]">
              <SidebarClient
                tenantName="Demo Store"
                storeLogo={null}
                pendingOrdersCount={3}
                userEmail="demo@indigo.store"
                userAvatarUrl={null}
                userFullName="Demo User"
                userRole="owner"
                planType="trial"
                trialDaysLeft={14}
                lowStockCount={5}
                totalProducts={42}
                monthlyRevenue={12500}
                storeSlug="demo"
              />
            </Sidebar>
            <SidebarInset className="flex-1 bg-[var(--ds-gray-50)]">
              <SidebarDemoContent />
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </div>
  )
}

function SidebarDemoContent() {
  const { state, toggleSidebar } = useSidebar()
  
  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSidebar}
          className="gap-2"
        >
          <PanelLeft className="h-4 w-4" />
          {state === "expanded" ? "Collapse" : "Expand"}
        </Button>
        <span className="text-sm text-[var(--ds-gray-600)]">
          State: <code className="rounded bg-[var(--ds-gray-200)] px-1.5 py-0.5 text-xs">{state}</code>
        </span>
      </div>
      <div className="rounded-lg border border-[var(--ds-gray-200)] bg-white p-4">
        <h3 className="text-sm font-medium text-[var(--ds-gray-900)] mb-2">Sidebar Features</h3>
        <ul className="space-y-2 text-sm text-[var(--ds-gray-600)]">
          <li>• Icons centered in 48px rail when collapsed</li>
          <li>• 40px hit targets for accessibility</li>
          <li>• Dropdown menus for nav items with children</li>
          <li>• Store switcher accessible in both states</li>
          <li>• User menu with account options</li>
          <li>• Indigo AI services panel</li>
          <li>• Keyboard shortcut: ⌘B to toggle</li>
        </ul>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function AnimationsDemo() {
  return (
    <div className="min-h-screen bg-[var(--ds-gray-100)]">
      <div className="mx-auto max-w-5xl p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--ds-gray-1000)]">
            Animated Components
          </h1>
          <p className="mt-1 text-sm text-[var(--ds-gray-600)]">
            A collection of delightful micro-animations for UI components and icons.
            Built on Framer Motion with Vercel/Geist design patterns.
            All animations respect <code className="rounded bg-[var(--ds-gray-200)] px-1 py-0.5 text-xs">prefers-reduced-motion</code>.
          </p>
        </header>

        {/* Demo Sections */}
        <div className="space-y-8">
          <DemoSection
            title="Animated Icons"
            description="Interactive icons with smooth state transitions. Click to toggle states."
          >
            <AnimatedIconsDemo />
          </DemoSection>

          <DemoSection
            title="Animated Buttons"
            description="Button components with various hover and tap animations."
          >
            <AnimatedButtonsDemo />
          </DemoSection>

          <DemoSection
            title="Animated Cards"
            description="Card components with different hover effects. Hover over each card to see the effect."
          >
            <AnimatedCardsDemo />
          </DemoSection>

          <DemoSection
            title="Animated Badges"
            description="Status badges with entrance animations and optional pulse effects."
          >
            <AnimatedBadgesDemo />
          </DemoSection>

          <DemoSection
            title="Form Components"
            description="Animated form controls including checkboxes, toggles, and inputs with validation states."
          >
            <FormComponentsDemo />
          </DemoSection>

          <DemoSection
            title="Animation Wrappers"
            description="Reusable wrapper components that add animations to any child element."
          >
            <AnimationWrappersDemo />
          </DemoSection>

          <DemoSection
            title="Utility Hooks"
            description="Custom hooks for applying consistent animations across components."
          >
            <UtilityHooksDemo />
          </DemoSection>

          <DemoSection
            title="Dashboard Sidebar"
            description="Collapsible sidebar with centered icons, dropdown menus, and full accessibility support."
          >
            <SidebarDemo />
            <div className="mt-4 pt-4 border-t border-[var(--ds-gray-200)]">
              <Link
                href="/demo/sidebar"
                className="inline-flex items-center gap-2 text-sm text-[var(--ds-blue-600)] hover:text-[var(--ds-blue-700)] hover:underline"
              >
                Open full standalone sidebar demo for R&D →
              </Link>
            </div>
          </DemoSection>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-[var(--ds-gray-200)] pt-6">
          <p className="text-xs text-[var(--ds-gray-500)]">
            Import from <code className="rounded bg-[var(--ds-gray-200)] px-1 py-0.5">@/components/ui/animated</code>
          </p>
        </footer>
      </div>
    </div>
  )
}

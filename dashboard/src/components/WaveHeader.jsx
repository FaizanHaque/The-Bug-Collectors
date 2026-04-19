import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

export default function WaveHeader() {
  return (
    <header className="wave-header">
      <div className="wave-header__waves" aria-hidden="true">
        <div className="wave-header__layer wave-header__layer--a" />
        <div className="wave-header__layer wave-header__layer--b" />
        <div className="wave-header__layer wave-header__layer--c" />
      </div>

      <motion.div
        className="wave-header__bar"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.h1
          className="wave-header__title"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
        >
          Ocean Data Explorer
        </motion.h1>
        <motion.p
          className="wave-header__subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22, duration: 0.4 }}
        >
          Explore fish larvae, salinity, pH, and temperature through a yearly interactive timeline.
        </motion.p>
        <nav className="wave-header__nav" aria-label="Top pages">
          <NavLink to="/">Explorer</NavLink>
          <NavLink to="/ocean-status">Whats Happening to Our Oceans</NavLink>
          <NavLink to="/fish-importance">Why Fish Matter</NavLink>
          <NavLink to="/what-we-can-do">What We Can Do</NavLink>
        </nav>
      </motion.div>
    </header>
  );
}

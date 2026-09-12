# NES Principles

Version: 1.0

---

# Purpose

The principles in this document define how engineering is practised within the Ninnis Engineering System (NES).

They are not programming rules.

They are engineering rules.

Every principle has been earned through real investigations rather than invented in advance.

As NES grows, this document will evolve.

---

# Principle 001

## Observe Before Changing

### Statement

Never change software behaviour until the current behaviour has been observed and understood.

### Why

Changing code too early destroys valuable evidence and often makes investigations more difficult.

### Example

Samsung Journey Auto Resume investigation.

---

# Principle 002

## Facts Before Conclusions

### Statement

Evidence comes before opinion.

### Why

Engineering decisions should be based upon observations rather than assumptions.

---

# Principle 003

## Every Bug Is An Investigation

### Statement

Treat every bug as an investigation rather than simply a fault to remove.

### Why

Every investigation teaches something about the software and about engineering.

---

# Principle 004

## Follow The Baton

### Statement

Follow information through the system before investigating individual components.

### Why

Most difficult bugs are caused by information failing to move correctly through the system.

---

# Principle 005

## Investigate Boundaries Before Components

### Statement

Check every hand-off before assuming a component is faulty.

### Why

Many software defects occur at interfaces between components rather than inside them.

---

# Principle 006

## UNKNOWN Is A Valid Engineering State

### Statement

Never pretend certainty where evidence does not exist.

### Why

Good engineers are comfortable saying "we don't know yet."

---

# Principle 007

## Instrumentation Must Never Change Behaviour

### Statement

Diagnostics observe.

They never influence.

### Why

Investigation tools should never alter the behaviour being investigated.

---

# Principle 008

## Build Observability First

### Statement

If the system cannot explain itself, improve observability before changing behaviour.

### Why

Better visibility leads to better engineering decisions.

---

# Principle 009

## Leave Better Tools Behind

### Statement

Every investigation should leave the project easier to investigate than before.

### Why

Engineering knowledge should compound over time.

---

# Principle 010

## Measure Progress By Uncertainty Removed

### Statement

Progress is measured by understanding gained rather than lines of code written.

### Why

Removing uncertainty reduces engineering risk.

---

# NES Reminder

The purpose of these principles is not to make software development slower.

The purpose is to make software development more reliable.

Reliable engineering produces reliable software.
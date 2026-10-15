import assert from "node:assert/strict";
import test from "node:test";
import { addDays, starterTasks, validDate, weekEnd, weekStart } from "./domain.ts";

test("four-week starter generates ten tasks per week with the expected team allocation", () => {
  const tasks = starterTasks("2026-10-19");
  assert.equal(tasks.length, 40);
  for (let week=1;week<=4;week++) {
    const weekly=tasks.filter((task)=>task.week_number===week);
    assert.equal(weekly.length,10);
    assert.equal(weekly.filter((task)=>task.team==="internal").length,4);
    assert.equal(weekly.filter((task)=>task.team==="external").length,4);
    assert.equal(weekly.filter((task)=>task.team==="campaign").length,2);
    assert.ok(weekly.every((task)=>task.due_on>=task.starts_on));
    assert.ok(weekly.every((task)=>task.due_on<=weekEnd("2026-10-19",week)));
  }
});

test("starter dates are calendar-date safe and match October 2026 rollout", () => {
  assert.equal(weekStart("2026-10-19",1),"2026-10-19");
  assert.equal(weekEnd("2026-10-19",1),"2026-10-25");
  assert.equal(weekStart("2026-10-19",4),"2026-11-09");
  assert.equal(weekEnd("2026-10-19",4),"2026-11-15");
  assert.equal(addDays("2026-12-30",3),"2027-01-02");
  assert.equal(validDate("2026-02-29"),false);
  assert.equal(validDate("2028-02-29"),true);
  assert.equal(validDate("2026-13-01"),false);
});

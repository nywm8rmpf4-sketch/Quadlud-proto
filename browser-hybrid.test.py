#!/usr/bin/env python3
"""Mobile browser regression for the standalone hybrid prototype."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'qa-artifacts'
OUT.mkdir(exist_ok=True)
URL='http://127.0.0.1:8765/'

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.goto(URL,wait_until='networkidle')
    assert page.locator('#board .cell').count()==36
    assert page.locator('#strategy').input_value()=='hybrid-full'
    page.select_option('#difficulty','expert')
    initial=page.evaluate('QuadludPlayableProto.getSnapshot().state.flat().join(",")')
    page.click('#coachBtn')
    assert page.locator('#coachBox .validation').is_visible()
    page.click('#coachPlay')
    changed=page.evaluate('QuadludPlayableProto.getSnapshot().state.flat().join(",")')
    assert changed!=initial
    page.click('#undoBtn');assert page.evaluate('QuadludPlayableProto.getSnapshot().state.flat().join(",")')==initial
    page.click('#redoBtn');assert page.evaluate('QuadludPlayableProto.getSnapshot().state.flat().join(",")')==changed
    page.click('#resetBtn');assert page.evaluate('QuadludPlayableProto.getSnapshot().state.flat().join(",")')==initial

    branch_seen=False
    for _ in range(40):
        page.click('#tutorBtn')
        badge=page.locator('#tutorBox .badge').inner_text()
        if badge in ('CONTRADICTION','COMMON-CONSEQUENCE'):
            branch_seen=True
            page.screenshot(path=str(OUT/'mobile-branch-where.png'),full_page=True)
            page.click('#tutorNext')
            assert page.locator('.cell.hypothesis-cell').count()==1
            page.screenshot(path=str(OUT/'mobile-branch-hypothesis.png'),full_page=True)
            while page.locator('#tutorNext').inner_text()!='Jouer':
                page.click('#tutorNext')
                if page.locator('.cell.hypothetical-step').count():
                    assert page.locator('.cell.hypothetical-step').first.get_attribute('data-step')
                    page.screenshot(path=str(OUT/'mobile-branch-step.png'),full_page=True)
            assert page.locator('.cell.conclusion').count()>=1
            page.screenshot(path=str(OUT/'mobile-branch-conclusion.png'),full_page=True)
            break
        for _ in range(3): page.click('#tutorNext')
        assert page.locator('#tutorNext').inner_text()=='Jouer'
        page.click('#tutorNext')
    assert branch_seen,'No hybrid contradiction reached in Expert tutor path'
    assert not errors,errors

    page.click('#resetBtn')
    page.click('#solveAllBtn')
    page.wait_for_function("document.querySelector('#solveAllBtn').disabled===false")
    assert 'grille résolue' in page.locator('#status').inner_text().lower()
    stats=page.locator('#solverStats').inner_text()
    assert 'patterns' in stats and 'classiques' in stats and 'contradictions' in stats
    page.screenshot(path=str(OUT/'mobile-solved.png'),full_page=True)
    browser.close()
print('PASS mobile browser: Coach, Tutor hybrid trace, visual roles, Undo/Redo/reset, solve-all')

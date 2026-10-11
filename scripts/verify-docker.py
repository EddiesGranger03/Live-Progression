"""Verify the local Docker deployment and data persistence using a temporary account.

Run from the project directory: python scripts/verify-docker.py
This restarts and recreates only this project's web service. It deletes its own test account.
"""
import http.cookiejar
import json
import os
from pathlib import Path
import secrets
import subprocess
import time
import urllib.request
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get('SOLO_TEST_URL', 'http://localhost:8080').rstrip('/')
client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))


def request(path, data=None):
    body = None if data is None else json.dumps(data).encode('utf-8')
    req = urllib.request.Request(BASE + path, data=body, headers={
        'Content-Type': 'application/json', 'Origin': BASE,
    })
    with client.open(req, timeout=8) as response:
        return json.load(response)


def wait_for_health():
    deadline = time.monotonic() + 45
    while time.monotonic() < deadline:
        try:
            if request('/api/v1/health')['status'] == 'ok':
                return
        except (OSError, ValueError):
            pass
        time.sleep(1)
    raise RuntimeError('Docker API did not become healthy within 45 seconds.')


def action(kind, data):
    revision = request('/api/v1/state')['revision']
    return request('/api/v1/actions', {
        'kind': kind, 'data': data, 'mutationId': str(uuid4()), 'revision': revision,
    })


wait_for_health()
credentials = {'name': 'Docker verification', 'email': f'docker-qa-{uuid4().hex}@example.com',
               'password': secrets.token_urlsafe(24)}
created = False
try:
    state = request('/api/v1/auth/signup', credentials)
    created = True
    assert state['xp'] == 0 and state['quests'] == []
    state = action('quest.save', {'title': 'Docker persistence check', 'duration': 10,
                                'date': '2026-10-11', 'goal': 'Cá nhân'})
    quest_id = state['quests'][-1]['id']
    state = action('quest.complete', {'id': quest_id})
    assert state['xp'] == 20
    subprocess.run(['docker', 'compose', 'restart', 'web'], cwd=ROOT, check=True)
    wait_for_health()
    # A new login also proves that the account/password survived the restart.
    state = request('/api/v1/auth/login', credentials)
    assert state['xp'] == 20
    assert any(q['id'] == quest_id and q['status'] == 'completed' for q in state['quests'])
    subprocess.run(['docker', 'compose', 'up', '-d', '--no-build', '--force-recreate',
                    '--wait', '--wait-timeout', '60', 'web'], cwd=ROOT, check=True)
    wait_for_health()
    state = request('/api/v1/auth/login', credentials)
    assert state['xp'] == 20
    assert any(q['id'] == quest_id and q['status'] == 'completed' for q in state['quests'])
    report = {'baseUrl': BASE, 'passed': [
        'Health endpoint is ready.',
        'New account starts empty with 0 XP.',
        'Completing a quest grants 20 XP.',
        'Account, completed quest and XP persist after Docker container restart.',
        'Named volume retains account, quest and XP after replacing the container.',
    ]}
    (ROOT / 'artifacts').mkdir(exist_ok=True)
    (ROOT / 'artifacts/docker-results.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=2))
finally:
    if created:
        # The current cookie belongs exclusively to this verification account.
        request('/api/v1/auth/delete', {'confirmation': 'XÓA'})

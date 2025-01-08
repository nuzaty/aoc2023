param (
    [Parameter(Mandatory=$true)][string]$session
 )

$base_url = "https://adventofcode.com"

$req_session = [Microsoft.PowerShell.Commands.WebRequestSession]::new()
$cookie = [System.Net.Cookie]::new('session', $session)
$req_session.Cookies.Add($base_url, $cookie)

$first_day = 1;
$last_day = 25;

for ($i=$first_day; $i -le $last_day; $i++) {
    $url = "$base_url/2023/day/$i/input"
    $output = "src/day$i/input.txt"
    Invoke-WebRequest -Uri $url -WebSession $req_session -OutFile $output
    Write-Output "day $i is downloaded."
    Start-Sleep -Seconds 1
}
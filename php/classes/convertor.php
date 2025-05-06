<?php
class Convertor {}
interface CanConvert
{
    public function Convert(float $value): float|bool;
}
class CryptoConvertor extends Convertor
{
    public function __construct(public string $currencyCode) {}
    public function Convert(float $value): float|bool
    {
        $code = $this->currencyCode;
        $url = "https://cex.io/api/ticker/$code/USD";
        $json = file_get_contents($url);
        if ($json != false) {
            $data = json_decode($json);
            $last = $data->last;
            return $value * $last;
        } else {
            return false;
        }
    }
}
?>

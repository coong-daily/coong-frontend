// 자산 데이터 타입 정의
export interface AssetResponse {
  id: number;
  name: string;
  amount: number;
}

// 계좌 데이터 타입 정의
export interface AccountResponseDto {
  id: number;
  accountNumber : string;
  bank: string;
  balance: number;
  accountType: string;
  expiryDate: string;
  status : string;
  memo: string;
}